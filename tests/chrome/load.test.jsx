import { screen, waitFor } from "@testing-library/react";

import { games } from "@/data";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";

import { renderApp } from "@tests/support/helpers.jsx";

const caps = vi.hoisted(() => ({}));

// Mutate this shared object per test: the app reads the mocked module, so
// there is no second instance of the real capability singleton to diverge
vi.mock("@/util/capability", async (importOriginal) => {
  Object.assign(caps, (await importOriginal()).default);
  return { default: caps };
});

vi.mock("@/util/storage/idb", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  deleteGame: vi.fn(),
  loadSummaries: vi.fn(),
  openFilePicker: vi.fn(),
  createGameFile: vi.fn(),
}));
vi.mock("@/util/storage/opfs", async (importOriginal) => ({
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
  // The app only calls window.api in the app, a test of it sets one
  delete window.api;
  // Browsers without the file system access api: the file input flow
  Object.assign(caps, { electron: false, system: false, internal: true });
  caps.apis = { ...caps.apis, save_file_picker: false };
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

  it("creates a new game in the origin private file system", async () => {
    opfs.saveGameFile.mockResolvedValue("internal:abc");
    opfs.loadGame.mockResolvedValue(internalGame);
    const { user, router } = renderApp("/games/");
    await screen.findByText("Saved Game");

    await user.click(screen.getByRole("button", { name: "New Game" }));

    const text = opfs.saveGameFile.mock.calls[0][0];
    expect(JSON.parse(text).info.title).toBe("New Game");
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/internal:abc/map"),
    );
  });

  it("creates a new game with the save picker when there is one", async () => {
    caps.system = true;
    caps.apis.save_file_picker = true;
    idb.createGameFile.mockResolvedValue("system:xyz");
    idb.loadGame.mockResolvedValue({
      ...games["18Test"],
      meta: { id: "xyz", type: "system", slug: "system:xyz" },
    });
    const { user, router } = renderApp("/games/");
    await screen.findByText("Shikoku 1889");

    await user.click(screen.getByRole("button", { name: "New Game" }));

    expect(idb.createGameFile).toHaveBeenCalledWith(
      expect.stringContaining('"title": "New Game"'),
      "new-game.json",
    );
    expect(opfs.saveGameFile).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/system:xyz/map"),
    );
  });

  it("uses the origin private file system when there is no save picker", async () => {
    caps.system = true;
    opfs.saveGameFile.mockResolvedValue("internal:abc");
    opfs.loadGame.mockResolvedValue(internalGame);
    const { user, router } = renderApp("/games/");
    await screen.findByText("Shikoku 1889");

    await user.click(screen.getByRole("button", { name: "New Game" }));

    expect(idb.createGameFile).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/internal:abc/map"),
    );
  });

  it("stays on the page when the save picker is cancelled", async () => {
    caps.system = true;
    caps.apis.save_file_picker = true;
    idb.createGameFile.mockResolvedValue(undefined);
    const { user, router } = renderApp("/games/");
    await screen.findByText("Shikoku 1889");

    await user.click(screen.getByRole("button", { name: "New Game" }));

    await waitFor(() => expect(idb.createGameFile).toHaveBeenCalled());
    expect(router.state.location.pathname).toBe("/games/");
  });

  it("alerts when creating the game fails", async () => {
    opfs.saveGameFile.mockRejectedValue(new Error("disk full"));
    const { user, router } = renderApp("/games/");
    await screen.findByText("Saved Game");

    await user.click(screen.getByRole("button", { name: "New Game" }));

    expect(await screen.findByText("disk full")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/games/");
  });

  it("hides the new game button without any storage", async () => {
    caps.internal = false;
    renderApp("/games/");
    await screen.findByText("Shikoku 1889");
    expect(
      screen.queryByRole("button", { name: "New Game" }),
    ).not.toBeInTheDocument();
  });

  describe("in the app", () => {
    it("asks the main process, not the picker", async () => {
      Object.assign(caps, { electron: true, system: false, internal: false });
      const noop = vi.fn();
      window.api = {
        onAlert: noop,
        onProgress: noop,
        onRedirect: noop,
        onSave: noop,
        onMenu: noop,
        setLanguage: noop,
        onGame: noop,
        onUpdate: noop,
        onDownloadProgress: noop,
        off: noop,
        addRecent: noop,
        loadPlatformAndVersions: () => ({ platform: "darwin", versions: {} }),
        loadSummaries: vi.fn().mockResolvedValue({ electron: {} }),
        newGame: vi.fn().mockResolvedValue("electron:new"),
        loadGame: vi.fn().mockResolvedValue({
          ...games["18Test"],
          meta: { id: "new", type: "electron", slug: "electron:new" },
        }),
      };
      const { user, router } = renderApp("/games/");
      await screen.findByText("Shikoku 1889");

      await user.click(screen.getByRole("button", { name: "New Game" }));

      expect(window.api.newGame).toHaveBeenCalledWith("New Game");
      expect(idb.createGameFile).not.toHaveBeenCalled();
      expect(opfs.saveGameFile).not.toHaveBeenCalled();
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/games/electron:new/map"),
      );
    });
  });

  describe("a game of the app that can not be loaded", () => {
    const electronSummary = {
      title: "Broken Game",
      publisher: "self",
      id: "abc",
      type: "electron",
      slug: "electron:abc",
    };
    const noop = vi.fn();
    const setupApp = (summaries) => {
      Object.assign(caps, { electron: true, system: false, internal: false });
      const error = Object.assign(new Error("not valid"), { code: "invalid" });
      window.api = {
        onAlert: noop,
        onProgress: noop,
        onRedirect: noop,
        onSave: noop,
        onMenu: noop,
        setLanguage: noop,
        onGame: noop,
        onUpdate: noop,
        onDownloadProgress: noop,
        off: noop,
        addRecent: noop,
        loadPlatformAndVersions: () => ({ platform: "darwin", versions: {} }),
        loadSummaries: vi.fn(async () => ({ electron: summaries.current })),
        loadGame: vi.fn().mockRejectedValue(error),
        deleteGame: vi.fn(() => {
          summaries.current = {};
        }),
      };
    };

    it("says why in the language of the page and stays in the library", async () => {
      setupApp({ current: { "electron:abc": electronSummary } });
      const { user, router } = renderApp("/games/");
      await user.click(
        await screen.findByRole("link", { name: "Broken Game" }),
      );

      expect(
        await screen.findByText("The file of this game is not valid JSON"),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/games/"),
      );
      // The library page loads its summaries again after the redirect
      expect(
        await screen.findByRole("link", { name: "Broken Game" }),
      ).toBeVisible();
    });

    it("can still be forgotten from the library", async () => {
      const summaries = { current: { "electron:abc": electronSummary } };
      setupApp(summaries);
      const { user, store } = renderApp("/games/");
      await screen.findByRole("link", { name: "Broken Game" });

      await user.click(screen.getByRole("button", { name: "Forget" }));

      expect(window.api.deleteGame).toHaveBeenCalledWith("abc");
      await waitFor(() =>
        expect(
          screen.queryByRole("link", { name: "Broken Game" }),
        ).not.toBeInTheDocument(),
      );
      expect(store.getState().summaries.electron).toEqual({});
    });
  });

  it("does not offer forgetting an internal game, its only copy", async () => {
    renderApp("/games/");
    await screen.findByRole("link", { name: "Saved Game" });
    expect(
      screen.queryByRole("button", { name: "Forget" }),
    ).not.toBeInTheDocument();
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

describe("load games filters", () => {
  const second = {
    ...summary,
    title: "Other Game",
    designer: "Ann Lee, Bob Ray and Cy Doe",
    publisher: "gmt",
    id: "def",
    type: "system",
    slug: "system:def",
  };
  const bare = {
    title: "Bare Game",
    id: "ghi",
    type: "internal",
    slug: "internal:ghi",
  };

  const pick = async (user, label, option) => {
    await user.click(screen.getByRole("combobox", { name: label }));
    await user.click(await screen.findByRole("option", { name: option }));
  };

  beforeEach(() => {
    opfs.loadSummaries.mockResolvedValue({
      "internal:abc": summary,
      "internal:ghi": bare,
    });
    idb.loadSummaries.mockResolvedValue({ "system:def": second });
    caps.system = true;
  });

  it("lists loaded games in their own section above bundled games", async () => {
    renderApp("/games/");
    await screen.findByText("Saved Game");
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual([
      "Your games",
      "Bundled games",
      "Test games",
    ]);
    const titles = screen
      .getAllByRole("link")
      .map((l) => l.textContent)
      .filter((x) =>
        [
          "Bare Game",
          "Other Game",
          "Saved Game",
          "Shikoku 1889",
          "18Broken",
          "18Test",
        ].includes(x),
      );
    expect(titles).toEqual([
      "Bare Game",
      "Other Game",
      "Saved Game",
      "Shikoku 1889",
      "18Broken",
      "18Test",
    ]);
  });

  it("filters by type", async () => {
    const { user } = renderApp("/games/");
    await screen.findByText("Saved Game");
    await pick(user, "Type", "Bundled");
    expect(screen.queryByText("Saved Game")).not.toBeInTheDocument();
    expect(screen.getByText("Shikoku 1889")).toBeInTheDocument();
    await pick(user, "Type", "Loaded");
    expect(screen.getByText("Saved Game")).toBeInTheDocument();
    expect(screen.queryByText("Shikoku 1889")).not.toBeInTheDocument();
  });

  it("splits designers and never offers a missing one", async () => {
    const { user } = renderApp("/games/");
    await screen.findByText("Saved Game");
    await user.click(screen.getByRole("combobox", { name: "Designer" }));
    expect(screen.getByRole("option", { name: "Bob Ray" })).toBeInTheDocument();
    // Sorted by last name: Doe, Lee, Ray
    expect(
      screen
        .getAllByRole("option")
        .map((o) => o.textContent)
        .filter((t) => ["Cy Doe", "Ann Lee", "Bob Ray"].includes(t)),
    ).toEqual(["Cy Doe", "Ann Lee", "Bob Ray"]);
    expect(
      screen.queryByRole("option", { name: "undefined" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Bob Ray" }));
    expect(screen.getByText("Other Game")).toBeInTheDocument();
    expect(screen.queryByText("Saved Game")).not.toBeInTheDocument();
    expect(screen.queryByText("Bare Game")).not.toBeInTheDocument();
  });

  it("combines filters and shows a message when nothing matches", async () => {
    const { user } = renderApp("/games/");
    await screen.findByText("Saved Game");
    await pick(user, "Publisher", "GMT Games");
    expect(screen.getByText("Other Game")).toBeInTheDocument();
    expect(screen.queryByText("Saved Game")).not.toBeInTheDocument();
    await pick(user, "Type", "Bundled");
    expect(
      screen.getByText("No games match these filters"),
    ).toBeInTheDocument();
  });

  it("hides the type filter and loaded section without loaded games", async () => {
    opfs.loadSummaries.mockResolvedValue({});
    idb.loadSummaries.mockResolvedValue({});
    renderApp("/games/");
    await screen.findByText("Shikoku 1889");
    expect(
      screen.queryByRole("combobox", { name: "Type" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual(["Test games"]);
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
