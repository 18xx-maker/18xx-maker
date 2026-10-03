import { act, screen, waitFor } from "@testing-library/react";
import { page } from "vitest/browser";

import { createSetExportSheetOpen } from "@/state";

import { renderApp } from "@tests/helpers.jsx";

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
    onDownloadProgress: vi.fn(),
    onGame: vi.fn(),
    onProgress: vi.fn(),
    onRedirect: vi.fn(),
    onUpdate: vi.fn(),
  });
});

// What the request is made of: "b18" for the box, else the file extensions
const formatsOf = () => {
  const request = api.export.mock.calls[0][0];
  if (request.b18) return ["b18"];
  return [...new Set(request.jobs.map(({ path }) => path.split(".").pop()))];
};

describe("export keys", () => {
  it("x opens the export menu of the game showing", async () => {
    const { user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("x");
    expect(
      await screen.findByRole("menuitem", { name: "Export options" }),
    ).toBeInTheDocument();
  });

  it("x goes to the loaded game and opens the menu", async () => {
    const { user, router } = renderApp("/", {
      loadedGame: {
        title: "18Test",
        id: "18Test",
        type: "app",
        slug: "18Test",
      },
    });
    await screen.findByTestId("home");

    await user.keyboard("x");
    await screen.findByRole("menuitem", { name: "Export options" });
    expect(router.state.location.pathname).toBe("/games/18Test/map");
  });

  it("x does nothing on the b18 pages, which have no export button", async () => {
    const { user, store } = renderApp("/games/18Test/b18");
    await screen.findByRole("heading", { level: 1 }).catch(() => null);

    await user.keyboard("x");
    expect(store.getState().ui.exportMenuOpen).toBe(false);
  });

  it("the menu is closed after leaving the game page", async () => {
    const { user, store } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("x");
    await screen.findByRole("menu");
    await user.keyboard("h");
    await screen.findByTestId("home");
    await waitFor(() =>
      expect(store.getState().ui).toEqual({
        exportMenuOpen: false,
        exportSheetOpen: false,
      }),
    );
  });

  it("x from another page keeps the menu open in strict mode", async () => {
    const { user, router } = renderApp(
      "/",
      {
        loadedGame: {
          title: "18Test",
          id: "18Test",
          type: "app",
          slug: "18Test",
        },
      },
      { strict: true },
    );
    await screen.findByTestId("home");

    await user.keyboard("x");
    await screen.findByRole("menuitem", { name: "Export options" });
    expect(router.state.location.pathname).toBe("/games/18Test/map");
  });

  it("the options sheet is closed after leaving the game page", async () => {
    const { user, store } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("x");
    await screen.findByRole("menu");
    await user.keyboard("o");
    await screen.findByRole("dialog", { name: "Export 18Test" });
    expect(store.getState().ui.exportSheetOpen).toBe(true);

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(store.getState().ui.exportSheetOpen).toBe(false),
    );
    act(() => store.dispatch(createSetExportSheetOpen(true)));
    await user.keyboard("h");
    await screen.findByTestId("home");
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
    });
  });

  it("x does nothing on a section that does not exist", async () => {
    const { user, store } = renderApp("/games/18Test/nonsense");
    await screen.findByTestId("game-18Test-nonsense").catch(() => null);

    await user.keyboard("x");
    expect(store.getState().ui.exportMenuOpen).toBe(false);
  });

  it("the flags do not outlive a game that fails to load", async () => {
    const { user, router, store } = renderApp("/", {
      loadedGame: {
        title: "Gone",
        id: "gone",
        type: "bogus",
        slug: "bogus:gone",
      },
    });
    await screen.findByTestId("home");

    await user.keyboard("x");
    await waitFor(() => expect(router.state.location.pathname).toBe("/games/"));
    await waitFor(() =>
      expect(store.getState().ui).toEqual({
        exportMenuOpen: false,
        exportSheetOpen: false,
      }),
    );

    await act(() => router.navigate("/games/18Test/map"));
    await screen.findByTestId("game-18Test-map");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("x does nothing without a loaded game", async () => {
    const { user, router } = renderApp("/");
    await screen.findByTestId("home");

    await user.keyboard("x");
    expect(router.state.location.pathname).toBe("/");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it.for([
    ["p", "pdf"],
    ["n", "png"],
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

    await screen.findByRole("dialog", { name: "Export 18Test" });
    expect(api.export).not.toHaveBeenCalled();
    expect(api.chooseExportFolder).not.toHaveBeenCalled();
    expect(router.state.location.pathname).toBe("/games/18Test/map");
  });
});
