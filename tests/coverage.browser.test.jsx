import {
  createEvent,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";
import { page } from "vitest/browser";

import { games } from "@/data";
import * as idb from "@/util/idb";
import * as opfs from "@/util/opfs";

import { renderApp } from "@tests/helpers.jsx";

const caps = vi.hoisted(() => ({}));

// Mutated per test, see tests/chrome.load.test.jsx
vi.mock("@/util/capability", async (importOriginal) => {
  Object.assign(caps, (await importOriginal()).default);
  return { default: caps };
});

vi.mock("@/util/idb", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  loadSummaries: vi.fn(),
  saveGameHandle: vi.fn(),
}));
vi.mock("@/util/opfs", async (importOriginal) => ({
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
      expect(store.getState().alert).toMatchObject({
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
      expect(store.getState().alert).toMatchObject({
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

    drop({ files: [new File(["x"], "x.txt")] });

    await waitFor(() =>
      expect(store.getState().alert).toMatchObject({
        message: "Not a game",
        type: "error",
      }),
    );
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
      expect(store.getState().alert).toMatchObject({
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
