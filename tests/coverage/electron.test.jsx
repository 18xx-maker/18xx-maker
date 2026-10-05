import {
  act,
  createEvent,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";
import { page } from "vitest/browser";

import { games } from "@/data";
import { docPath } from "@/export/names.js";
import { createUpdate } from "@/state";

import { renderApp } from "@tests/support/helpers.jsx";

vi.mock("@/data/games", async (importOriginal) => {
  const { withBareGame } = await import("@tests/support/bare.js");
  return { default: withBareGame((await importOriginal()).default) };
});

// The electron preload api, faked. analytics reads it at import time, so it
// has to exist before the app modules are imported.
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

const config = {
  config: { theme: "gmt" },
  path: "/home/me/config.json",
  platform: "darwin",
  versions: { app: "9.9.9", chrome: "130", electron: "33", system: "24.1" },
};

beforeEach(async () => {
  await page.viewport(1280, 800);
  Object.assign(api, {
    addRecent: vi.fn(),
    checkForUpdates: vi.fn(),
    deleteGame: vi.fn(),
    downloadUpdate: vi.fn(),
    cancelExport: vi.fn(),
    chooseExportFolder: vi.fn(),
    export: vi.fn().mockResolvedValue({
      done: 1,
      total: 1,
      failed: [],
      cancelled: false,
    }),
    loadConfig: vi.fn().mockResolvedValue(config),
    loadPlatformAndVersions: vi.fn().mockReturnValue(config),
    loadSummaries: vi.fn().mockResolvedValue({}),
    off: vi.fn(),
    onAlert: vi.fn(),
    onDownloadProgress: vi.fn(),
    onGame: vi.fn(),
    onProgress: vi.fn(),
    onRedirect: vi.fn(),
    onUpdate: vi.fn(),
    openGame: vi.fn(),
    saveGamePath: vi.fn(),
  });
});

// The callback the app registered with a window.api.on* listener
const listener = (name) => api[name].mock.calls[0][0];

// Drop onto the app. jsdom-style plain objects are not accepted by the real
// DragEvent constructor, so the dataTransfer is set on the created event.
const drop = (dataTransfer) => {
  // eslint-disable-next-line testing-library/no-node-access
  const zone = document.getElementById("dropzone");
  const event = createEvent.drop(zone);
  Object.defineProperty(event, "dataTransfer", { value: dataTransfer });
  fireEvent(zone, event);
};

// The last export the app asked the main process for
const requested = () => api.export.mock.calls.at(-1)[0];

// The files of a request, as { page: file name } with the page relative to the
// game, "map?variation=0"
const exported = ({ jobs }) =>
  Object.fromEntries(
    jobs.map(({ doc, path }) => [
      docPath(doc).split("/").slice(3).join("/"),
      path,
    ]),
  );

const openExport = async (user) => {
  await user.click(await screen.findByRole("button", { name: "Export" }));
};

describe("electron root", () => {
  it("registers the main process listeners and removes them on unmount", () => {
    const { unmount } = renderApp("/");

    for (const name of [
      "onAlert",
      "onGame",
      "onProgress",
      "onRedirect",
      "onUpdate",
      "onDownloadProgress",
    ]) {
      expect(api[name]).toHaveBeenCalledTimes(1);
    }
    expect(api.off).not.toHaveBeenCalled();

    unmount();
    expect(api.off).toHaveBeenCalledTimes(1);
  });

  it("shows alerts and progress sent by the main process", async () => {
    const { store } = renderApp("/");

    act(() => listener("onAlert")("Saved", "All done", "success"));
    expect(store.getState().alert).toEqual({
      open: true,
      title: "Saved",
      message: "All done",
      type: "success",
    });
    expect(await screen.findByText("All done")).toBeInTheDocument();

    act(() => listener("onProgress")("Exporting", "map.pdf", 40));
    expect(store.getState().alert).toMatchObject({
      title: "Exporting",
      progress: 40,
    });
    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
  });

  it("loads a game sent by the main process and announces it", async () => {
    const { store } = renderApp("/");

    act(() => listener("onGame")(games["1889"]));

    expect(store.getState().game.meta.slug).toBe("1889");
    expect(store.getState().alert).toMatchObject({
      title: "Game Loaded",
      message: "Shikoku 1889 loaded",
      type: "success",
    });
  });

  it("follows redirects from the main process", async () => {
    const { router } = renderApp("/");

    await act(() => listener("onRedirect")("/docs"));

    expect(router.state.location.pathname).toBe("/docs");
  });

  it("stores update information and download progress", () => {
    const { store } = renderApp("/");

    act(() => listener("onUpdate")({ available: true, info: {} }));
    expect(store.getState().update).toEqual({ available: true, info: {} });

    act(() => listener("onDownloadProgress")(55));
    expect(store.getState().update.downloading).toBe(55);
  });

  it("saves a dropped file through the main process and opens it", async () => {
    api.saveGamePath.mockResolvedValue("1889");
    const { router } = renderApp("/");
    const transfer = new DataTransfer();
    transfer.items.add(
      new File(["{}"], "game.json", { type: "application/json" }),
    );

    drop(transfer);

    await waitFor(() =>
      expect(api.saveGamePath).toHaveBeenCalledWith(
        expect.objectContaining({ name: "game.json" }),
      ),
    );
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/1889/map"),
    );
  });

  it("alerts when the main process rejects a dropped file", async () => {
    api.saveGamePath.mockRejectedValue(
      new Error("File was not a valid 18xx-maker game"),
    );
    const { router, store } = renderApp("/");
    const file = new File(["nope"], "game.txt");

    // Without dataTransfer.items the file comes from dataTransfer.files
    drop({ files: [file] });

    await waitFor(() => expect(api.saveGamePath).toHaveBeenCalledWith(file));
    await waitFor(() =>
      expect(store.getState().alert).toMatchObject({
        title: "Error",
        message: "File was not a valid 18xx-maker game",
        type: "error",
      }),
    );
    expect(router.state.location.pathname).toBe("/");
  });

  it("ignores drops without files", () => {
    renderApp("/");

    drop(new DataTransfer());
    drop({ files: [] });
    drop(undefined);

    expect(api.saveGamePath).not.toHaveBeenCalled();
  });

  it("adds an opened game to the recent files", async () => {
    renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");

    expect(api.addRecent).toHaveBeenCalledWith("18Test", "18Test");
  });
});

describe("electron bindings", () => {
  it("opens a game from the main process with o", async () => {
    api.openGame.mockResolvedValue("1889");
    const { user, router } = renderApp("/");

    await user.keyboard("o");

    expect(api.openGame).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/1889"),
    );
  });

  it("stays put when the open dialog is cancelled", async () => {
    api.openGame.mockResolvedValue(undefined);
    const { user, router } = renderApp("/docs");

    await user.keyboard("o");

    await waitFor(() => expect(api.openGame).toHaveBeenCalledTimes(1));
    expect(router.state.location.pathname).toBe("/docs");
  });

  it("alerts when opening a game fails", async () => {
    const error = new Error("File was not a valid 18xx-maker game");
    api.openGame.mockRejectedValue(error);
    const { user, store } = renderApp("/");

    await user.keyboard("o");

    await waitFor(() =>
      expect(store.getState().alert).toMatchObject({
        title: "Error",
        message: "File was not a valid 18xx-maker game",
        type: "error",
      }),
    );
  });

  it("goes to the app page with u", async () => {
    const { user, router } = renderApp("/");

    await user.keyboard("u");

    expect(router.state.location.pathname).toBe("/app");
    expect(await screen.findByTestId("app")).toBeInTheDocument();
  });
});

describe("electron load games page", () => {
  it("opens a game through the main process", async () => {
    api.openGame.mockResolvedValue("1889");
    const { user, router } = renderApp("/games/");

    await user.click(await screen.findByRole("button", { name: "Open File" }));

    expect(api.openGame).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/1889/map"),
    );
    expect(api.loadSummaries).toHaveBeenCalled();
  });
});

describe("electron game info", () => {
  it("offers to save the game file instead of downloading it", async () => {
    renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");

    expect(
      await screen.findByRole("link", { name: "Save 18test.json" }),
    ).toHaveAttribute("download", "18test.json");
  });
});

describe("electron docs", () => {
  it("loads images relative to the app files", async () => {
    renderApp("/docs/output/png");

    expect(
      (await screen.findAllByRole("img", { name: /export button/i }))[0],
    ).toHaveAttribute("src", "./images/export-button-light.png");
  });
});

describe("app page", () => {
  it("shows the versions and the config file", async () => {
    renderApp("/app");

    expect(await screen.findByText("/home/me/config.json")).toBeInTheDocument();
    for (const version of ["24.1", "33", "130", "9.9.9"]) {
      expect(screen.getByText(version)).toBeInTheDocument();
    }
    expect(screen.getByTestId("app")).toHaveTextContent('"theme": "gmt"');
  });

  it.each(["darwin", "win32", "linux"])(
    "shows a platform icon on %s",
    async (platform) => {
      api.loadConfig.mockResolvedValue({ ...config, platform });
      renderApp("/app");

      const system = await screen.findByText("24.1");
      // eslint-disable-next-line testing-library/no-node-access
      expect(system.querySelector("svg")).not.toBeNull();
    },
  );

  it("shows no platform icon for an unknown platform", async () => {
    api.loadConfig.mockResolvedValue({ ...config, platform: "aix" });
    renderApp("/app");

    const system = await screen.findByText("24.1");
    // eslint-disable-next-line testing-library/no-node-access
    expect(system.querySelector("svg")).toBeNull();
  });

  it("shows nothing about updates before the main process reports", async () => {
    renderApp("/app");
    await screen.findByText("/home/me/config.json");

    expect(screen.queryByText(/No updates found/)).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("shows a spinner while checking", async () => {
    renderApp("/app", { update: { checking: true } });
    await screen.findByText("/home/me/config.json");

    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector(".animate-spin")).not.toBeNull();
  });

  it("shows the download progress", async () => {
    renderApp("/app", { update: { available: true, downloading: 30 } });

    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByText(/is available/)).not.toBeInTheDocument();
  });

  it("explains that updates are off in dev mode", async () => {
    renderApp("/app", { update: { available: false, dev: true } });

    expect(
      await screen.findByText("Updates are disabled in dev mode."),
    ).toBeInTheDocument();
  });

  it("reports the latest version and checks again on request", async () => {
    const { user } = renderApp("/app", {
      update: { available: false, info: { version: "9.9.9" } },
    });

    expect(
      await screen.findByText("No updates found. 9.9.9 is the latest version!"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Check for updates" }));
    expect(api.checkForUpdates).toHaveBeenCalledTimes(1);
  });

  it("reports an update check error", async () => {
    renderApp("/app", { update: { available: false, error: true } });

    expect(
      await screen.findByText("No updates found. Latest version unknown."),
    ).toBeInTheDocument();
  });

  it("downloads an available update and starts the progress at zero", async () => {
    const { user, store } = renderApp("/app", {
      update: { available: true, info: { version: "10.0.0" } },
    });

    expect(await screen.findByText("10.0.0 is available!")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Download and install update" }),
    );

    expect(api.downloadUpdate).toHaveBeenCalledTimes(1);
    expect(store.getState().update.downloading).toBe(0);
    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
  });

  it("follows update changes from the state", async () => {
    const { store } = renderApp("/app");
    await screen.findByText("/home/me/config.json");

    act(() => store.dispatch(createUpdate({ checking: true })));
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector(".animate-spin")).not.toBeNull();
  });
});

describe("export button", () => {
  it("replaces the print button in the toolbar", async () => {
    renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Print" }),
    ).not.toBeInTheDocument();
  });

  it("is not shown with ?print=true", async () => {
    renderApp("/games/18Test/map?print=true");
    await screen.findByTestId("game-18Test-map");

    expect(
      screen.queryByRole("button", { name: "Export" }),
    ).not.toBeInTheDocument();
  });

  it("alerts when the main process fails to export", async () => {
    api.export.mockRejectedValueOnce(new Error("No windows"));
    const { user, store } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await openExport(user);
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Export game as pdf documents",
      }),
    );

    await waitFor(() =>
      expect(store.getState().alert).toMatchObject({
        title: "Export failed",
        message: "No windows",
        type: "error",
      }),
    );
  });

  it("sends the game and the layers of its config below the url, not the url", async () => {
    const { user } = renderApp("/games/18Test/map?config.paper.width=111", {
      config: { paper: { height: 222 } },
    });
    await screen.findByTestId("game-18Test-map");

    await openExport(user);
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Export game as pdf documents",
      }),
    );

    const { game, config, dpi } = requested();
    expect(game.meta.slug).toBe("18Test");
    expect(config).toMatchObject({ paper: { height: 222 } });
    expect(config.paper.width).toBeUndefined();
    expect(dpi).toBe(300);
  });

  it("exports every page of the game as pdfs", async () => {
    const { user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await openExport(user);
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Export game as pdf documents",
      }),
    );

    expect(api.export).toHaveBeenCalledTimes(1);
    expect(requested().single).toBeUndefined();
    expect(exported(requested())).toEqual({
      background: "pdf/18test-background.pdf",
      revenue: "pdf/18test-revenue.pdf",
      "revenue?paginated=true": "pdf/18test-revenue-paginated.pdf",
      cards: "pdf/18test-cards.pdf",
      tokens: "pdf/18test-tokens.pdf",
      charters: "pdf/18test-charters.pdf",
      map: "pdf/18test-map.pdf",
      "map?paginated=true": "pdf/18test-map-paginated.pdf",
      market: "pdf/18test-market.pdf",
      "market?paginated=true": "pdf/18test-market-paginated.pdf",
      par: "pdf/18test-par.pdf",
      "tile-manifest": "pdf/18test-tile-manifest.pdf",
      tiles: "pdf/18test-tiles.pdf",
    });
  });

  it("exports every layout when all layouts is configured", async () => {
    const { user } = renderApp("/games/18Test/map", {
      config: { export: { allLayouts: true } },
    });
    await screen.findByTestId("game-18Test-map");

    await openExport(user);
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Export game as pdf documents",
      }),
    );

    const items = exported(requested());
    expect(items).not.toHaveProperty("cards");
    expect(items).not.toHaveProperty("tokens");
    expect(items).not.toHaveProperty("tiles");
    expect(items).toMatchObject({
      "cards?config.cards.layout=free": "pdf/18test-cards-free.pdf",
      "cards?config.cards.layout=miniEuroDie":
        "pdf/18test-cards-miniEuroDie.pdf",
      "cards?config.cards.layout=dtgDie": "pdf/18test-cards-dtgDie.pdf",
      "tokens?config.tokens.layout=free": "pdf/18test-tokens-free.pdf",
      "tokens?config.tokens.layout=gsp": "pdf/18test-tokens-gsp.pdf",
      "tiles?config.tiles.layout=offset": "pdf/18test-tiles-offset.pdf",
      "tiles?config.tiles.layout=individual": "pdf/18test-tiles-individual.pdf",
      "tiles?config.tiles.layout=die": "pdf/18test-tiles-die.pdf",
      "tiles?config.tiles.layout=smallDie": "pdf/18test-tiles-smallDie.pdf",
    });
  });

  it("exports every map variation", async () => {
    // 18Test from disk with two maps
    api.loadGame = vi.fn().mockResolvedValue({
      ...games["18Test"],
      meta: { id: "abc", type: "electron", slug: "electron:abc" },
      map: [games["18Test"].map, games["18Test"].map],
    });
    const { user } = renderApp("/games/electron:abc/map");
    await screen.findByTestId("game-electron:abc-map");
    expect(api.loadGame).toHaveBeenCalledWith("abc");

    await openExport(user);
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Export game as pdf documents",
      }),
    );
    const pdfs = exported(requested());
    expect(pdfs).toMatchObject({
      "map?variation=0": "pdf/18test-map-0.pdf",
      "map?paginated=true&variation=0": "pdf/18test-map-0-paginated.pdf",
      "map?variation=1": "pdf/18test-map-1.pdf",
      "map?paginated=true&variation=1": "pdf/18test-map-1-paginated.pdf",
    });
    expect(pdfs).not.toHaveProperty("map");
    expect(pdfs).not.toHaveProperty("map?variation=2");
    // The windows that capture it show the game as the render page, by id
    expect(requested().id).toBe("abc");
    expect(requested().jobs[0].doc.route).toBe("/games/render:abc/background");

    await openExport(user);
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Export game as png images",
      }),
    );
    const pngs = exported(requested());
    expect(pngs).toMatchObject({
      "map?variation=0": "png/18test-map-0.png",
      "map?variation=1": "png/18test-map-1.png",
    });
    expect(pngs).not.toHaveProperty("map");
  });

  it("skips the components a game does not have", async () => {
    // Bare has tiles and tokens but no map, companies, stock or trains
    const { user } = renderApp("/games/Bare/tiles");
    await screen.findByTestId("game-Bare-tiles");

    await openExport(user);
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Export game as pdf documents",
      }),
    );
    expect(Object.keys(exported(requested())).sort()).toEqual(
      // No cards either, the shared list checks the game has some
      [
        "background",
        "revenue",
        "revenue?paginated=true",
        "tile-manifest",
        "tiles",
        "tokens",
      ].sort(),
    );

    await openExport(user);
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Export game as png images",
      }),
    );
    const pngs = Object.keys(exported(requested()));
    expect(
      pngs
        .filter((k) => !k.startsWith("tiles/") && !k.startsWith("tokens/"))
        .sort(),
    ).toEqual(["background", "revenue", "tile-manifest"].sort());
    // Without companies the game tokens are numbered from one
    expect(exported(requested())["tokens/0"]).toBe("png/bare-token-1.png");
  });

  it("exports an svg for the components that are drawings", async () => {
    const { user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await openExport(user);
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Export game as svg images",
      }),
    );

    expect(api.export).toHaveBeenCalledTimes(1);
    const items = exported(requested());
    expect(items).toMatchObject({
      map: "svg/18test-map.svg",
      market: "svg/18test-market.svg",
      par: "svg/18test-par.svg",
      revenue: "svg/18test-revenue.svg",
      "tokens/0": "svg/18test-token-1-BLRR.svg",
    });
    expect(Object.values(items).every((name) => name.endsWith(".svg"))).toBe(
      true,
    );
    expect(Object.keys(items)).not.toContain("background");
    expect(Object.keys(items).some((page) => page.includes("paginated"))).toBe(
      false,
    );
  });

  it("exports every component of the game as pngs", async () => {
    const { user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await openExport(user);
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Export game as png images",
      }),
    );

    expect(api.export).toHaveBeenCalledTimes(1);
    const items = exported(requested());
    expect(items).toMatchObject({
      background: "png/18test-background.png",
      revenue: "png/18test-revenue.png",
      // One number card per player count, 18Test seats 1 to 6
      "cards/number/1": "png/18test-card-number-1.png",
      "cards/number/6": "png/18test-card-number-6.png",
      "cards/private/0": "png/18test-card-private-1.png",
      "cards/private/5": "png/18test-card-private-6.png",
      "cards/train/1": "png/18test-card-train-2-3+1.png",
      "cards/train/3": "png/18test-card-train-4-8E.png",
      map: "png/18test-map.png",
      market: "png/18test-market.png",
      par: "png/18test-par.png",
      "tile-manifest": "png/18test-tile-manifest.png",
      "tiles/1": "png/18test-tile-1.png",
      // Tile ids are escaped in the url and made safe in the filename
      "tiles/26%7CT2": "png/18test-tile-26_T2.png",
    });
    expect(items).not.toHaveProperty("cards/number/7");
    expect(items).not.toHaveProperty("cards/private/6");

    // Shares, charters and tokens are numbered and named after the company
    const shares = Object.keys(items).filter((k) =>
      k.startsWith("cards/share/"),
    );
    expect(shares.length).toBeGreaterThan(0);
    expect(items["cards/share/0"]).toMatch(
      /^png\/18test-card-share-1-\w+\.png$/,
    );
    expect(items["charters/0"]).toMatch(/^png\/18test-charter-1-\w+\.png$/);
    expect(items["tokens/0"]).toMatch(/^png\/18test-token-1-\w+\.png$/);
  });

  it("exports the Board18 box of the game", async () => {
    const { user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await openExport(user);
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Export game as a Board18 box",
      }),
    );

    expect(api.export).toHaveBeenCalledTimes(1);
    const { b18, jobs } = requested();
    // The names that are data, a function could not be sent
    expect(b18.names).toEqual({
      folder: "board18-18Test-1.0",
      zip: "board18-18Test-1.0.zip",
      json: "board18-18Test-1.0/18Test-1.0.json",
    });
    expect(b18.json).toMatchObject({ bname: "18Test", version: "1.0" });
    expect(() => structuredClone(requested())).not.toThrow();
    expect(jobs.map(({ path }) => path)).toEqual(
      expect.arrayContaining([
        "board18-18Test-1.0/18Test-1.0/Map.png",
        "board18-18Test-1.0/18Test-1.0/Market.png",
        "board18-18Test-1.0/18Test-1.0/Tokens.png",
      ]),
    );
    expect(jobs.every(({ format }) => format === "b18")).toBe(true);
    expect(
      jobs.find(({ path }) => path.endsWith("/Map.png")).doc,
    ).toMatchObject({
      route: "/games/render:18Test/b18/map",
      query: { print: "true" },
      capture: { background: true },
    });
    expect(
      jobs.find(({ path }) => path.endsWith("/Tokens.png")).doc.capture,
    ).toMatchObject({ viewport: { w: 60 }, background: false });
  });
});
