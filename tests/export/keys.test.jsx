import { act, screen, waitFor } from "@testing-library/react";
import { page } from "vitest/browser";

import { createSetExportSheetOpen, createSetGame } from "@/state";

import { renderApp } from "@tests/support/helpers.jsx";

const api = vi.hoisted(() => {
  window.api = {
    loadPlatformAndVersions: () => ({ platform: "darwin", versions: {} }),
  };
  return window.api;
});

const caps = vi.hoisted(() => ({}));

vi.mock("@/util/capability", async (importOriginal) => {
  Object.assign(caps, (await importOriginal()).default, { electron: true });
  return { default: caps };
});

beforeEach(async () => {
  await page.viewport(1280, 900);
  Object.assign(api, {
    addRecent: vi.fn(),
    checkForUpdates: vi.fn(),
    chooseExportFolder: vi.fn(),
    export: vi.fn().mockResolvedValue({ done: 1, total: 1, failed: [] }),
    loadConfig: vi.fn().mockResolvedValue({ config: {}, versions: {} }),
    loadSummaries: vi.fn().mockResolvedValue({}),
    off: vi.fn(),
    onAlert: vi.fn(),
    onAssets: vi.fn(),
    onDownloadProgress: vi.fn(),
    onGame: vi.fn(),
    onProgress: vi.fn(),
    onRedirect: vi.fn(),
    onSave: vi.fn(),
    onMenu: vi.fn(),
    setLanguage: vi.fn(),
    onUpdate: vi.fn(),
  });
});

// What the request is made of: "b18" for the box, else the file extensions
const formatsOf = () => {
  const request = api.export.mock.calls[0][0];
  if (request.b18) return ["b18"];
  return [...new Set(request.jobs.map(({ path }) => path.split(".").pop()))];
};

// A game of the last session that is gone, it cannot be loaded
const missing = {
  ...{ title: "Gone", id: "Gone" },
  type: "bundled",
  slug: "bundled:Gone",
};

const loaded = {
  title: "18Test",
  id: "18Test",
  type: "app",
  slug: "18Test",
};

// A page that is not a game page, with the game loaded as when it was visited
const renderOnSettings = async (options) => {
  const view = renderApp("/games/18Test/map", {}, options);
  await screen.findByTestId("game-18Test-map");
  await act(() => view.router.navigate("/settings"));
  await screen.findByRole("heading", { name: "Settings" });
  return view;
};

describe("export keys", () => {
  it("x exports the game of the last session without opening a game page", async () => {
    const { user, store, router } = renderApp("/settings", {
      loadedGame: { ...loaded, type: "bundled", slug: "bundled:18Test" },
    });
    await screen.findByRole("heading", { name: "Settings" });
    await waitFor(() => expect(store.getState().game).toBeTruthy());

    await user.keyboard("x");
    expect(
      await screen.findByRole("menuitem", { name: "Export options" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/settings");
    expect(
      store.getState().alerts?.some?.((a) => a.title === "Game Loaded") ??
        false,
    ).toBe(false);
  });

  it("x opens the export menu of the game showing", async () => {
    const { user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("x");
    expect(
      await screen.findByRole("menuitem", { name: "Export options" }),
    ).toBeInTheDocument();
  });

  it("x opens the menu on another page without leaving it", async () => {
    const { user, router } = await renderOnSettings();

    await user.keyboard("x");
    expect(
      await screen.findByRole("menuitem", { name: "Export options" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/settings");
  });

  it("x opens the menu in strict mode", async () => {
    const { user } = await renderOnSettings({ strict: true });

    await user.keyboard("x");
    expect(
      await screen.findByRole("menuitem", { name: "Export options" }),
    ).toBeInTheDocument();
  });

  it("x opens the menu on the b18 pages", async () => {
    const { user } = renderApp("/games/18Test/b18");
    await screen.findByRole("heading", { level: 1 }).catch(() => null);

    await user.keyboard("x");
    expect(
      await screen.findByRole("menuitem", { name: "Export options" }),
    ).toBeInTheDocument();
  });

  it("the menu exports the loaded game from another page", async () => {
    const { user } = await renderOnSettings();

    await user.keyboard("x");
    await screen.findByRole("menu");
    await user.keyboard("p");

    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    expect(formatsOf()).toEqual(["pdf"]);
    expect(api.export.mock.calls[0][0].jobs[0].path).toMatch(/18test/i);
  });

  it("the options open from another page", async () => {
    const { user } = await renderOnSettings();

    await user.keyboard("x");
    await screen.findByRole("menu");
    await user.keyboard("o");
    expect(
      await screen.findByRole("dialog", { name: "Export 18Test" }),
    ).toBeInTheDocument();
  });

  it("x does nothing while the options are open", async () => {
    const { user, store } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    act(() => store.dispatch(createSetExportSheetOpen(true)));
    expect(
      await screen.findByRole("dialog", { name: "Export 18Test" }),
    ).toBeInTheDocument();
    await user.keyboard("x");
    expect(store.getState().ui.exportMenuOpen).toBe(false);
  });

  it("the menu is closed when the game is forgotten", async () => {
    const { user, store } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("x");
    await screen.findByRole("menu");
    act(() => store.dispatch(createSetGame(undefined)));
    await waitFor(() =>
      expect(store.getState().ui).toEqual({
        exportMenuOpen: false,
        exportSheetOpen: false,
        panel: {},
      }),
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("the options are closed when the game is forgotten", async () => {
    const { store } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    act(() => store.dispatch(createSetExportSheetOpen(true)));
    expect(
      await screen.findByRole("dialog", { name: "Export 18Test" }),
    ).toBeInTheDocument();
    act(() => store.dispatch(createSetGame(undefined)));
    await waitFor(() =>
      expect(store.getState().ui.exportSheetOpen).toBe(false),
    );
  });

  it("x does nothing on the print page", async () => {
    const { user, store } = renderApp("/games/18Test/map?print=true");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("x");
    expect(store.getState().ui).toEqual({
      exportMenuOpen: false,
      exportSheetOpen: false,
      panel: {},
    });
  });

  it("x does nothing when the game of the last session cannot be loaded", async () => {
    const { user, router, store } = renderApp("/", { loadedGame: missing });
    await screen.findByTestId("home");

    await user.keyboard("x");
    expect(router.state.location.pathname).toBe("/");
    expect(store.getState().ui.exportMenuOpen).toBe(false);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("x does nothing without a loaded game", async () => {
    const { user, router } = renderApp("/");
    await screen.findByTestId("home");

    await user.keyboard("x");
    expect(router.state.location.pathname).toBe("/");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("the toolbar button opens the menu", async () => {
    const { user, store } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.click(screen.getByRole("button", { name: "Export" }));
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    expect(store.getState().ui.exportMenuOpen).toBe(false);
  });

  it("the sidebar entry opens the menu on any page", async () => {
    const { user } = await renderOnSettings();

    await user.click(screen.getByRole("button", { name: /^Export/ }));
    expect(
      await screen.findByRole("menuitem", { name: "Export options" }),
    ).toBeInTheDocument();
  });

  it("the sidebar has no export entry without a game that loaded", async () => {
    renderApp("/", { loadedGame: missing });
    await screen.findByTestId("home");

    expect(
      screen.queryByRole("button", { name: /^Export/ }),
    ).not.toBeInTheDocument();
  });

  it.for([
    ["p", "pdf"],
    ["n", "png"],
    ["s", "svg"],
    ["b", "b18"],
  ])("%s in the menu exports %s", async ([key, format]) => {
    const { user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("x");
    await screen.findByRole("menu");
    await user.keyboard(key);

    await waitFor(() => expect(api.export).toHaveBeenCalledTimes(1));
    expect(formatsOf()).toEqual([format]);
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  });

  it("o in the menu opens the export options", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("x");
    await screen.findByRole("menu");
    await user.keyboard("o");

    expect(
      await screen.findByRole("dialog", { name: "Export 18Test" }),
    ).toBeInTheDocument();
    expect(api.export).not.toHaveBeenCalled();
    expect(api.chooseExportFolder).not.toHaveBeenCalled();
    expect(router.state.location.pathname).toBe("/games/18Test/map");
  });

  it("p does not print, the app exports with x", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    const { user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("p");
    expect(print).not.toHaveBeenCalled();
    print.mockRestore();
  });
});
