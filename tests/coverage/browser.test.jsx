import {
  act,
  createEvent,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";
import { page } from "vitest/browser";

import { games } from "@/data";
import { editGame, selectLatestAlert } from "@/state";
import { selectGameChanged } from "@/state/selectors";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";

import { renderApp } from "@tests/support/helpers.jsx";

const caps = vi.hoisted(() => ({}));

// Mutated per test, see tests/chrome/load.test.jsx
vi.mock("@/util/capability", async (importOriginal) => {
  Object.assign(caps, (await importOriginal()).default);
  return { default: caps };
});

vi.mock("@/util/storage/idb", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  loadSummaries: vi.fn(),
  saveGameHandle: vi.fn(),
}));
vi.mock("@/util/storage/opfs", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  loadSummaries: vi.fn(),
  saveGameFile: vi.fn(),
}));

// 18Test loaded from the file system, with two map variations
const systemGame = {
  ...games["18Test"],
  meta: { id: "abc", type: "system", slug: "system:abc" },
  map: [
    { ...games["18Test"].map, name: "North" },
    { ...games["18Test"].map, name: "South" },
  ],
};

beforeEach(async () => {
  vi.clearAllMocks();
  await page.viewport(1280, 800);
  Object.assign(caps, { electron: false, system: true, internal: true });
  idb.loadGame.mockResolvedValue(systemGame);
  idb.loadSummaries.mockResolvedValue({});
  opfs.loadSummaries.mockResolvedValue({});
});

const drop = (dataTransfer) => {
  // eslint-disable-next-line testing-library/no-node-access
  const zone = document.getElementById("dropzone");
  const event = createEvent.drop(zone);
  Object.defineProperty(event, "dataTransfer", { value: dataTransfer });
  fireEvent(zone, event);
};

describe("dropping a config file", () => {
  it("applies the settings without leaving the page", async () => {
    const { router, store } = renderApp("/docs");
    const transfer = new DataTransfer();
    transfer.items.add(
      new File(['{"margin": 100}'], "config.json", {
        type: "application/json",
      }),
    );

    drop(transfer);

    await waitFor(() =>
      expect(store.getState().config).toEqual({ margin: 100 }),
    );
    expect(router.state.location.pathname).toBe("/docs");
    expect(opfs.saveGameFile).not.toHaveBeenCalled();
    expect(idb.saveGameHandle).not.toHaveBeenCalled();
  });
});

describe("dropping a game file", () => {
  it("accepts drags over the app so files can be dropped", () => {
    renderApp("/");
    // eslint-disable-next-line testing-library/no-node-access
    const zone = document.getElementById("dropzone");
    const event = createEvent.dragOver(zone);

    fireEvent(zone, event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("stores the file system handle with the file system access api", async () => {
    idb.saveGameHandle.mockResolvedValue("1889");
    const handle = { kind: "file", name: "game.json" };
    const { router } = renderApp("/");

    drop({
      items: [
        { kind: "file", getAsFileSystemHandle: () => Promise.resolve(handle) },
      ],
    });

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/1889/map"),
    );
    expect(idb.saveGameHandle).toHaveBeenCalledWith(handle);
    expect(opfs.saveGameFile).not.toHaveBeenCalled();
  });

  it("copies the file into the private file system otherwise", async () => {
    caps.system = false;
    opfs.saveGameFile.mockResolvedValue("1889");
    const { router } = renderApp("/");
    const transfer = new DataTransfer();
    transfer.items.add(new File(["{}"], "game.json"));

    drop(transfer);

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/1889/map"),
    );
    expect(opfs.saveGameFile).toHaveBeenCalledWith(
      expect.objectContaining({ name: "game.json" }),
    );
    expect(idb.saveGameHandle).not.toHaveBeenCalled();
  });

  it("alerts when the browser cannot store dropped files", async () => {
    Object.assign(caps, { system: false, internal: false });
    const { router, store } = renderApp("/docs");
    const transfer = new DataTransfer();
    transfer.items.add(new File(["{}"], "game.json"));

    drop(transfer);

    await waitFor(() =>
      expect(selectLatestAlert(store.getState())).toMatchObject({
        title: "Error",
        message: "Your browser does not support dropping files",
        type: "error",
      }),
    );
    expect(router.state.location.pathname).toBe("/docs");
  });

  it("alerts when something that is not a file is dropped", async () => {
    const { router, store } = renderApp("/docs");

    drop({ items: [{ kind: "string" }] });

    await waitFor(() =>
      expect(selectLatestAlert(store.getState())).toMatchObject({
        title: "Error",
        message: "Only files can be dropped here",
        type: "error",
      }),
    );
    expect(idb.saveGameHandle).not.toHaveBeenCalled();
    expect(router.state.location.pathname).toBe("/docs");
  });

  it("alerts when a dropped file cannot be stored", async () => {
    caps.system = false;
    opfs.saveGameFile.mockRejectedValue(new Error("Not a game"));
    const { store } = renderApp("/");

    drop({ files: [new File(["x"], "x.json")] });

    await waitFor(() =>
      expect(selectLatestAlert(store.getState())).toMatchObject({
        message: "Not a game",
        type: "error",
      }),
    );
  });
});

// The values of ui.loadingGame a store has had, to tell that nothing showed
const trackLoading = (store) => {
  const seen = [];
  store.subscribe(() => {
    const loading = store.getState().ui.loadingGame;
    if (loading) seen.push(loading.name);
  });
  return seen;
};

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const internalGame = {
  ...games["18Test"],
  meta: { id: "abc", type: "internal", slug: "internal:abc" },
};

describe("loading a dropped game", () => {
  beforeEach(() => {
    caps.system = false;
    opfs.loadGame.mockResolvedValue(internalGame);
  });

  const dropGame = (name = "game.json") => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(["{}"], name, { type: "application/json" }));
    drop(transfer);
  };

  it("shows the file while it is saved, then clears and opens the game", async () => {
    const save = deferred();
    opfs.saveGameFile.mockReturnValue(save.promise);
    const { router, store } = renderApp("/docs");

    dropGame("my-game.json");

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("File: my-game.json");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(router.state.location.pathname).toBe("/docs");

    save.resolve("internal:abc");

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/internal:abc/map"),
    );
    expect(screen.queryByTestId("loading-game")).not.toBeInTheDocument();
    expect(store.getState().ui.loadingGame).toBeNull();
    expect(store.getState().game.meta.slug).toBe("internal:abc");
  });

  it("clears and alerts when the file cannot be saved", async () => {
    const save = deferred();
    opfs.saveGameFile.mockReturnValue(save.promise);
    const { router, store } = renderApp("/docs");
    dropGame();
    await screen.findByTestId("loading-game");

    save.reject(new Error("Not a game"));

    await waitFor(() =>
      expect(selectLatestAlert(store.getState())).toMatchObject({
        message: "Not a game",
        type: "error",
      }),
    );
    expect(screen.queryByTestId("loading-game")).not.toBeInTheDocument();
    expect(store.getState().ui.loadingGame).toBeNull();
    expect(router.state.location.pathname).toBe("/docs");
  });

  it("clears and alerts once when the saved game cannot be loaded", async () => {
    opfs.saveGameFile.mockResolvedValue("internal:abc");
    opfs.loadGame.mockRejectedValue(new Error("File was not valid"));
    const { router, store } = renderApp("/docs");

    dropGame();

    await waitFor(() =>
      expect(selectLatestAlert(store.getState())).toMatchObject({
        message: "File was not valid",
        type: "error",
      }),
    );
    await waitFor(() => expect(store.getState().ui.loadingGame).toBeNull());
    expect(
      store.getState().alert.items.filter((a) => a.type === "error"),
    ).toHaveLength(1);
    expect(router.state.location.pathname).toBe("/docs");
  });

  it("shows nothing for a config drop", async () => {
    const { store } = renderApp("/docs");
    const seen = trackLoading(store);
    const transfer = new DataTransfer();
    transfer.items.add(new File(['{"margin": 100}'], "config.json"));

    drop(transfer);

    await waitFor(() =>
      expect(store.getState().config).toEqual({ margin: 100 }),
    );
    expect(seen).toEqual([]);
  });

  it("shows nothing for a dropped item that is not a file", async () => {
    caps.system = true;
    const { store } = renderApp("/docs");
    const seen = trackLoading(store);

    drop({ items: [{ kind: "string" }] });

    await waitFor(() =>
      expect(selectLatestAlert(store.getState())).toMatchObject({
        message: "Only files can be dropped here",
      }),
    );
    expect(seen).toEqual([]);
  });

  it("follows the latest of two drops in a row", async () => {
    const first = deferred();
    const second = deferred();
    opfs.saveGameFile
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const { store } = renderApp("/docs");

    dropGame("one.json");
    await waitFor(() =>
      expect(store.getState().ui.loadingGame?.name).toBe("one.json"),
    );
    dropGame("two.json");
    await waitFor(() =>
      expect(store.getState().ui.loadingGame?.name).toBe("two.json"),
    );

    // The first finishing neither hides the second nor opens its game
    first.resolve("internal:abc");
    await new Promise((r) => setTimeout(r, 50));
    expect(opfs.loadGame).not.toHaveBeenCalled();
    expect(store.getState().ui.loadingGame?.name).toBe("two.json");
    expect(screen.getByTestId("loading-game")).toHaveTextContent("two.json");

    second.resolve("internal:abc");
    await waitFor(() => expect(store.getState().ui.loadingGame).toBeNull());
  });

  it("opens a dropped game once from another game's page", async () => {
    opfs.saveGameFile.mockResolvedValue("internal:abc");
    const { router, store } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");
    const loaded = () =>
      store.getState().alert.items.filter((a) => a.title === "Game Loaded");
    const before = loaded().length;

    dropGame();

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/internal:abc/map"),
    );
    await waitFor(() => expect(store.getState().ui.loadingGame).toBeNull());
    await screen.findByTestId("game-internal:abc-map");
    expect(opfs.loadGame).toHaveBeenCalledTimes(1);
    expect(opfs.loadGame).toHaveBeenCalledWith("abc");
    expect(loaded()).toHaveLength(before + 1);
  });

  it("stays on the latest drop when an earlier one finishes last", async () => {
    const first = deferred();
    const second = deferred();
    opfs.saveGameFile
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    opfs.loadGame.mockImplementation(async (id) => ({
      ...internalGame,
      meta: { id, type: "internal", slug: `internal:${id}` },
    }));
    const { router, store } = renderApp("/docs");

    dropGame("one.json");
    await waitFor(() => expect(opfs.saveGameFile).toHaveBeenCalledTimes(1));
    dropGame("two.json");
    await waitFor(() => expect(opfs.saveGameFile).toHaveBeenCalledTimes(2));

    second.resolve("internal:two");
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/internal:two/map"),
    );
    first.resolve("internal:one");
    await new Promise((r) => setTimeout(r, 50));

    expect(opfs.loadGame).toHaveBeenCalledTimes(1);
    expect(router.state.location.pathname).toBe("/games/internal:two/map");
    expect(store.getState().game.meta.slug).toBe("internal:two");
  });

  it("keeps the edits when the open game is dropped again", async () => {
    opfs.saveGameFile.mockResolvedValue("internal:abc");
    const { router, store } = renderApp("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    act(() => {
      store.dispatch(
        editGame((g) => ({ ...g, info: { ...g.info, title: "Renamed" } })),
      );
    });
    expect(selectGameChanged(store.getState())).toBe(true);

    dropGame();

    await waitFor(() => expect(opfs.saveGameFile).toHaveBeenCalled());
    await waitFor(() => expect(store.getState().ui.loadingGame).toBeNull());
    expect(store.getState().game.info.title).toBe("Renamed");
    expect(router.state.location.pathname).toBe("/games/internal:abc/map");
  });
});

describe("file system games", () => {
  it("refreshes the game from its file on the info page", async () => {
    const { user, store } = renderApp("/games/system:abc");
    await screen.findByTestId("game-system:abc");
    expect(idb.loadGame).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => expect(idb.loadGame).toHaveBeenCalledTimes(2));
    expect(idb.loadGame).toHaveBeenLastCalledWith("abc");
    await waitFor(() =>
      expect(selectLatestAlert(store.getState())).toMatchObject({
        title: "Game Refreshed",
        type: "success",
      }),
    );
  });

  it("refreshes the game from the toolbar", async () => {
    const { user } = renderApp("/games/system:abc/tiles");
    await screen.findByTestId("game-system:abc-tiles");

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => expect(idb.loadGame).toHaveBeenCalledTimes(2));
  });

  it("has no refresh button for bundled games", async () => {
    renderApp("/games/18Test/tiles");
    await screen.findByTestId("game-18Test-tiles");

    expect(
      screen.queryByRole("button", { name: "Refresh" }),
    ).not.toBeInTheDocument();
  });

  it("switches between map variations", async () => {
    const { user, router } = renderApp("/games/system:abc/map");
    await screen.findByTestId("game-system:abc-map");

    const variation = screen.getByRole("combobox", { name: "Map Variation" });
    expect(variation).toHaveTextContent("North");

    await user.click(variation);
    await user.click(await screen.findByRole("option", { name: "South" }));

    expect(router.state.location.search).toContain("variation=1");
    expect(
      screen.getByRole("combobox", { name: "Map Variation" }),
    ).toHaveTextContent("South");
  });

  it("offers no variations for a single map", async () => {
    renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    expect(
      screen.queryByRole("combobox", { name: "Map Variation" }),
    ).not.toBeInTheDocument();
  });
});
