import { screen, waitFor } from "@testing-library/react";

import { games } from "@/data";
import * as idb from "@/util/idb";
import * as opfs from "@/util/opfs";

import { renderApp } from "@tests/helpers.jsx";

const caps = vi.hoisted(() => ({}));

// Mutate this shared object per test: the app reads the mocked module, so
// there is no second instance of the real capability singleton to diverge
vi.mock("@/util/capability", async (importOriginal) => {
  Object.assign(caps, (await importOriginal()).default);
  return { default: caps };
});

vi.mock("@/util/idb", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  deleteGame: vi.fn(),
  loadSummaries: vi.fn(),
  openFilePicker: vi.fn(),
}));
vi.mock("@/util/opfs", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  deleteGame: vi.fn(),
  loadSummaries: vi.fn(),
  saveGameFile: vi.fn(),
}));

const internalGame = {
  ...games["18Test"],
  meta: { id: "abc", type: "internal", slug: "internal:abc" },
};
const summary = {
  title: "Saved Game",
  subtitle: "Sub",
  designer: "Designer",
  publisher: "self",
  id: "abc",
  type: "internal",
  slug: "internal:abc",
};

beforeEach(() => {
  vi.clearAllMocks();
  // Browsers without the file system access api: the file input flow
  Object.assign(caps, { electron: false, system: false, internal: true });
  opfs.loadSummaries.mockResolvedValue({ "internal:abc": summary });
  idb.loadSummaries.mockResolvedValue({});
});

describe("load games page", () => {
  it("lists bundled and saved games from loaded summaries", async () => {
    const { store } = renderApp("/games/");
    expect(await screen.findByText("Saved Game")).toBeInTheDocument();
    expect(screen.getByText("Shikoku 1889")).toBeInTheDocument();

    expect(opfs.loadSummaries).toHaveBeenCalledTimes(1);
    // idb is not used without the file system access api
    expect(idb.loadSummaries).not.toHaveBeenCalled();
    expect(store.getState().summaries.internal).toEqual({
      "internal:abc": summary,
    });
    expect(store.getState().summaries.system).toBeUndefined();
  });

  it("saves a chosen file and opens the game", async () => {
    opfs.saveGameFile.mockResolvedValue("internal:abc");
    opfs.loadGame.mockResolvedValue(internalGame);
    const { user, router, store } = renderApp("/games/");
    await screen.findByText("Saved Game");

    const file = new File(["{}"], "game.json", { type: "application/json" });
    await user.upload(screen.getByLabelText("Open File"), file);

    expect(opfs.saveGameFile).toHaveBeenCalledWith(file);
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/internal:abc/map"),
    );
    await waitFor(() =>
      expect(store.getState().loadedGame).toMatchObject({
        id: "abc",
        type: "internal",
        slug: "internal:abc",
      }),
    );
    expect(opfs.loadGame).toHaveBeenCalledWith("abc");
    expect(store.getState().game.meta.slug).toBe("internal:abc");
    expect(await screen.findByText("Game Loaded")).toBeInTheDocument();
  });

  it("alerts when saving the file fails", async () => {
    opfs.saveGameFile.mockRejectedValue(new Error("disk full"));
    const { user, router } = renderApp("/games/");
    await screen.findByText("Saved Game");

    await user.upload(
      screen.getByLabelText("Open File"),
      new File(["{}"], "game.json"),
    );

    expect(await screen.findByText("disk full")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/games/");
  });

  it("uses the file picker when the file system access api exists", async () => {
    caps.system = true;
    idb.openFilePicker.mockResolvedValue("system:xyz");
    idb.loadGame.mockResolvedValue({
      ...games["18Test"],
      meta: { id: "xyz", type: "system", slug: "system:xyz" },
    });
    const { user, router, store } = renderApp("/games/");
    await screen.findByText("Shikoku 1889");

    await user.click(screen.getByRole("button", { name: "Open File" }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/system:xyz/map"),
    );
    await waitFor(() =>
      expect(store.getState().loadedGame?.slug).toBe("system:xyz"),
    );
    expect(idb.loadSummaries).toHaveBeenCalled();
  });

  it("links each game to its info page and marks its type", async () => {
    renderApp("/games/");
    const saved = await screen.findByRole("link", { name: "Saved Game" });
    expect(saved).toHaveAttribute("href", "/games/internal:abc");
    expect(screen.getByRole("link", { name: "Shikoku 1889" })).toHaveAttribute(
      "href",
      "/games/1889",
    );
    // Only the saved game is badged as loaded from the computer
    expect(screen.getAllByText("Bundled").length).toBeGreaterThan(0);
    expect(screen.getAllByText("System")).toHaveLength(1);
  });
});

describe("game info page", () => {
  it("forgets a saved game and returns to the reloaded list", async () => {
    opfs.loadGame.mockResolvedValue(internalGame);
    opfs.deleteGame.mockResolvedValue();
    const { user, router, store } = renderApp("/games/internal:abc");
    await screen.findByTestId("game-internal:abc");

    // Like the real store: a forgotten game can no longer be loaded
    opfs.loadSummaries.mockResolvedValue({});
    opfs.loadGame.mockRejectedValue(new Error("Game abc not found"));
    await user.click(screen.getByRole("button", { name: "Forget" }));

    expect(opfs.deleteGame).toHaveBeenCalledWith("abc");
    await screen.findByTestId("games");
    expect(router.state.location.pathname).toMatch(/^\/games\/?$/);
    await waitFor(() =>
      expect(store.getState().summaries.internal).toEqual({}),
    );
    expect(screen.queryByText("Saved Game")).not.toBeInTheDocument();
    expect(store.getState().game).toBeUndefined();
    expect(store.getState().loadedGame).toBeUndefined();
  });

  it("confirms the game was forgotten", async () => {
    opfs.loadGame.mockResolvedValue(internalGame);
    opfs.deleteGame.mockResolvedValue();
    const { user } = renderApp("/games/internal:abc");
    await screen.findByTestId("game-internal:abc");

    opfs.loadGame.mockRejectedValue(new Error("Game abc not found"));
    await user.click(screen.getByRole("button", { name: "Forget" }));

    await screen.findByTestId("games");
    expect(screen.getByText("Game Forgotten")).toBeInTheDocument();
    expect(
      screen.getByText("Internal game 18Test forgotten"),
    ).toBeInTheDocument();
  });

  it("keeps the game and alerts when forgetting fails", async () => {
    opfs.loadGame.mockResolvedValue(internalGame);
    // Fails after the page was left for the list, like a real file system
    opfs.deleteGame.mockImplementation(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("locked")), 50),
        ),
    );
    const { user, router, store } = renderApp("/games/internal:abc");
    await screen.findByTestId("game-internal:abc");

    await user.click(screen.getByRole("button", { name: "Forget" }));

    expect(await screen.findByText("locked")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/games/internal:abc");
    expect(store.getState().game.meta.slug).toBe("internal:abc");
    // The router is back before React renders the page again
    expect(
      await screen.findByRole("button", { name: "Forget" }),
    ).toBeInTheDocument();
  });

  it("does not offer forgetting bundled games", async () => {
    renderApp("/games/1889");
    await screen.findByTestId("game-1889");
    expect(
      screen.queryByRole("button", { name: "Forget" }),
    ).not.toBeInTheDocument();
  });

  it("offers the game json as a download without its meta", async () => {
    renderApp("/games/18Test");
    const link = await screen.findByRole("link", {
      name: "Download 18test.json",
    });
    expect(link).toHaveAttribute("download", "18test.json");
    const json = await (await fetch(link.getAttribute("href"))).json();
    expect(json.info.title).toBe("18Test");
    expect(json.meta).toBeUndefined();
  });

  it("returns to the load page with an alert when a game cannot be loaded", async () => {
    opfs.loadGame.mockRejectedValue(new Error("File was not valid"));
    const { router, store } = renderApp("/games/internal:gone/map");

    expect(await screen.findByText("File was not valid")).toBeInTheDocument();
    await waitFor(() => expect(router.state.location.pathname).toBe("/games/"));
    expect(store.getState().game).toBeUndefined();
    expect(store.getState().alert).toMatchObject({
      open: true,
      type: "error",
      message: "File was not valid",
    });
  });
});
