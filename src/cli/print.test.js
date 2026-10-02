import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { chromium } from "playwright";

import print from "#cli/print";
import { UsageError, defaultConfig, loadGame, startExpress } from "#cli/util";

const mocks = vi.hoisted(() => {
  const page = { goto: vi.fn(), pdf: vi.fn() };
  const browser = { newPage: vi.fn(() => page), close: vi.fn() };
  const server = { close: vi.fn() };
  return { page, browser, server, customConfig: {} };
});

vi.mock("playwright", () => ({
  chromium: { launch: vi.fn(() => mocks.browser) },
}));

vi.mock("#cli/util", async (importOriginal) => ({
  ...(await importOriginal()),
  customConfig: mocks.customConfig,
  loadGame: vi.fn(),
  startExpress: vi.fn(() => mocks.server),
}));

const cwd = process.cwd();
let tmp;
let log;

const fullGame = {
  companies: [{}],
  map: {},
  stock: { par: { values: [100] } },
  tiles: {},
};

const printed = async (...args) => {
  await print(...args);
  return mocks.page.pdf.mock.calls.map(([options]) => options.path);
};

const addGame = (name) => fs.writeFileSync(`src/data/games/${name}.json`, "");

beforeEach(() => {
  vi.clearAllMocks();
  for (const key of Object.keys(mocks.customConfig)) {
    delete mocks.customConfig[key];
  }
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-cli-print-"));
  process.chdir(tmp);
  fs.mkdirSync("src/data/games", { recursive: true });
  log = vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
  process.chdir(cwd);
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe("print", () => {
  it("prints every page of a full game to pdf", async () => {
    addGame("18Full");
    loadGame.mockReturnValue(fullGame);

    const files = await printed("18Full", {});

    const tiles = defaultConfig.tiles.layout;
    const cards = defaultConfig.cards.layout;
    expect(files).toEqual([
      "render/18Full/18Full-background.pdf",
      `render/18Full/18Full-cards-${cards}.pdf`,
      "render/18Full/18Full-charters.pdf",
      "render/18Full/18Full-map.pdf",
      "render/18Full/18Full-map-paginated.pdf",
      "render/18Full/18Full-market.pdf",
      "render/18Full/18Full-market-paginated.pdf",
      "render/18Full/18Full-par.pdf",
      "render/18Full/18Full-par-paginated.pdf",
      "render/18Full/18Full-revenue.pdf",
      "render/18Full/18Full-revenue-paginated.pdf",
      "render/18Full/18Full-tile-manifest.pdf",
      `render/18Full/18Full-tiles-${tiles}.pdf`,
      "render/18Full/18Full-tokens.pdf",
    ]);
    expect(mocks.page.goto).toHaveBeenCalledWith(
      "http://localhost:9000/games/18Full/map?paginated=true",
      { waitUntil: "networkidle" },
    );
    expect(mocks.page.pdf).toHaveBeenCalledWith({
      path: "render/18Full/18Full-background.pdf",
      scale: 1.0,
      preferCSSPageSize: true,
    });
    expect(fs.statSync("render/18Full").isDirectory()).toBe(true);
    expect(mocks.browser.close).toHaveBeenCalledOnce();
  });

  it("skips pages the game has no data for", async () => {
    addGame("18Empty");
    loadGame.mockReturnValue({ stock: {} });

    const files = await printed("18Empty", {});

    expect(files).toEqual([
      "render/18Empty/18Empty-background.pdf",
      "render/18Empty/18Empty-market.pdf",
      "render/18Empty/18Empty-market-paginated.pdf",
      "render/18Empty/18Empty-revenue.pdf",
      "render/18Empty/18Empty-revenue-paginated.pdf",
    ]);
  });

  it("prints cards when a game only has players", async () => {
    addGame("18Players");
    loadGame.mockReturnValue({ players: [] });

    const files = await printed("18Players", {});
    expect(files).toContain(
      `render/18Players/18Players-cards-${defaultConfig.cards.layout}.pdf`,
    );
  });

  it("uses the custom tile and card layouts", async () => {
    addGame("18Full");
    loadGame.mockReturnValue(fullGame);
    mocks.customConfig.tiles = { layout: "custom-tiles" };
    mocks.customConfig.cards = { layout: "custom-cards" };

    const files = await printed("18Full", {});
    expect(files).toContain("render/18Full/18Full-tiles-custom-tiles.pdf");
    expect(files).toContain("render/18Full/18Full-cards-custom-cards.pdf");
  });

  it("prints every game json file with --all", async () => {
    addGame("18A");
    addGame("18B");
    fs.writeFileSync("src/data/games/index.js", "");
    loadGame.mockReturnValue({});

    const files = await printed(undefined, { all: true });

    expect(loadGame.mock.calls.map(([game]) => game).sort()).toEqual([
      "18A",
      "18B",
    ]);
    expect(files.sort()).toEqual([
      "render/18A/18A-background.pdf",
      "render/18A/18A-revenue-paginated.pdf",
      "render/18A/18A-revenue.pdf",
      "render/18B/18B-background.pdf",
      "render/18B/18B-revenue-paginated.pdf",
      "render/18B/18B-revenue.pdf",
    ]);
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/^Games: 18., 18.$/),
    );
  });

  it("throws a usage error when the game does not exist", async () => {
    await expect(print("18Missing", {})).rejects.toThrow(
      new UsageError("Game 18Missing not found"),
    );
    expect(chromium.launch).not.toHaveBeenCalled();
    expect(startExpress).not.toHaveBeenCalled();
  });

  it("waits for the browser and closes it and the server", async () => {
    addGame("18Full");
    loadGame.mockReturnValue(fullGame);
    let finished = false;
    mocks.browser.close.mockImplementationOnce(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      finished = true;
    });

    await print("18Full", {});

    expect(finished).toBe(true);
    expect(mocks.server.close).toHaveBeenCalledOnce();
    expect(process.exitCode).toBeUndefined();
  });

  it("closes the browser and server when the browser cannot start", async () => {
    addGame("18Full");
    loadGame.mockReturnValue(fullGame);
    chromium.launch.mockRejectedValueOnce(new Error("no browser"));

    await expect(print("18Full", {})).rejects.toThrow("no browser");
    expect(mocks.server.close).toHaveBeenCalledOnce();
  });

  it("keeps going and exits 1 when some documents fail", async () => {
    addGame("18Empty");
    loadGame.mockReturnValue({});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.page.pdf.mockRejectedValueOnce(new Error("timeout"));

    const files = await printed("18Empty", {});

    // All three documents were tried
    expect(files).toHaveLength(3);
    expect(error).toHaveBeenCalledWith(
      "Failed 18Empty-background.pdf: timeout",
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/1 documents failed:\n18Empty-background.pdf/),
    );
    expect(process.exitCode).toBe(1);
    expect(mocks.browser.close).toHaveBeenCalledOnce();
  });

  it("only starts the server in debug mode", async () => {
    await print("18Full", { debug: true });

    expect(startExpress).toHaveBeenCalledOnce();
    expect(fs.statSync("render").isDirectory()).toBe(true);
    expect(chromium.launch).not.toHaveBeenCalled();
    expect(mocks.server.close).not.toHaveBeenCalled();
  });
});
