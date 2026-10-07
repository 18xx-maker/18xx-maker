import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { chromium } from "playwright";

import print from "#cli/print";
import { UsageError, defaultConfig, loadGame, startServer } from "#cli/util";

const mocks = await vi.hoisted(async () => {
  const { createFakeBrowser } = await import("./__fixtures__/browser.js");
  return { ...createFakeBrowser(), customConfig: {} };
});

vi.mock("playwright", () => ({
  chromium: { launch: vi.fn(() => mocks.browser) },
}));

vi.mock("#cli/util", async (importOriginal) => {
  const real = await importOriginal();
  return {
    ...real,
    customConfig: mocks.customConfig,
    loadGame: vi.fn(),
    startServer: vi.fn(() => mocks.server),
  };
});

const { loadGame: realLoadGame } = await vi.importActual("#cli/util");

const cwd = process.cwd();
let tmp;
let log;

// The real 18Test game, which has every kind of data, with some changes
const game = (changes = {}) => ({ ...realLoadGame("18Test"), ...changes });

const printed = async (...args) => {
  await print(...args);
  return fs
    .readdirSync("render", { recursive: true })
    .filter((file) => file.endsWith(".pdf"))
    .map((file) => file.replaceAll("\\", "/").replace("/pdf/", "/"))
    .sort();
};

const addGame = (name) => fs.writeFileSync(`src/data/games/${name}.json`, "");

beforeEach(() => {
  vi.clearAllMocks();
  loadGame.mockImplementation(() => game());
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
  it("prints every page of a full game to pdf, named after the title", async () => {
    addGame("18Full");

    const files = await printed("18Full", {});

    const tiles = defaultConfig.tiles.layout;
    const cards = defaultConfig.cards.layout;
    expect(files).toEqual(
      [
        "18test-background.pdf",
        `18test-cards-${cards}.pdf`,
        "18test-charters.pdf",
        "18test-map.pdf",
        "18test-map-paginated.pdf",
        "18test-market.pdf",
        "18test-market-paginated.pdf",
        "18test-par.pdf",
        "18test-revenue.pdf",
        "18test-revenue-paginated.pdf",
        "18test-tile-manifest.pdf",
        `18test-tiles-${tiles}.pdf`,
        "18test-tokens.pdf",
      ]
        .map((file) => `18Full/${file}`)
        .sort(),
    );
    expect(mocks.page.goto).toHaveBeenCalledWith(
      "http://localhost:1234/games/render:18Full/map?paginated=true",
      { waitUntil: "networkidle" },
    );
    expect(mocks.session.send).toHaveBeenCalledWith("Page.printToPDF", {
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false,
      scale: 1,
      transferMode: "ReturnAsStream",
    });
    expect(mocks.session.send).toHaveBeenCalledWith(
      "Emulation.setEmulatedMedia",
      { media: "print" },
    );
    expect(
      fs.readFileSync("render/18Full/pdf/18test-background.pdf", "utf-8"),
    ).toBe("pdf");
    expect(mocks.browser.close).toHaveBeenCalledOnce();
  });

  it("skips pages the game has no data for", async () => {
    addGame("18Empty");
    loadGame.mockReturnValue(
      game({
        companies: undefined,
        map: undefined,
        players: undefined,
        privates: undefined,
        stock: { type: "1D" },
        tiles: undefined,
        tokens: undefined,
        trains: undefined,
      }),
    );

    const files = await printed("18Empty", {});

    expect(files).toEqual([
      "18Empty/18test-background.pdf",
      "18Empty/18test-revenue-paginated.pdf",
      "18Empty/18test-revenue.pdf",
    ]);
  });

  it("prints cards when a game only has players", async () => {
    addGame("18Players");
    loadGame.mockReturnValue(
      game({
        companies: undefined,
        privates: undefined,
        trains: undefined,
      }),
    );

    const files = await printed("18Players", {});
    expect(files).toContain(
      `18Players/18test-cards-${defaultConfig.cards.layout}.pdf`,
    );
  });

  it("uses the custom tile and card layouts", async () => {
    addGame("18Full");
    mocks.customConfig.tiles = { layout: "custom-tiles" };
    mocks.customConfig.cards = { layout: "custom-cards" };

    const files = await printed("18Full", {});
    expect(files).toContain("18Full/18test-tiles-custom-tiles.pdf");
    expect(files).toContain("18Full/18test-cards-custom-cards.pdf");
  });

  it("uses the layouts of the game's own config when allowed", async () => {
    addGame("18Full");
    mocks.customConfig.allowGameConfig = true;
    loadGame.mockReturnValue(game({ config: { cards: { layout: "dtgDie" } } }));

    const files = await printed("18Full", {});
    expect(files).toContain("18Full/18test-cards-dtgDie.pdf");
  });

  it("ignores the game's own config unless allowed", async () => {
    addGame("18Full");
    loadGame.mockReturnValue(game({ config: { cards: { layout: "dtgDie" } } }));

    const files = await printed("18Full", {});
    expect(files).not.toContain("18Full/18test-cards-dtgDie.pdf");
  });

  it("prints every game json file with --all", async () => {
    addGame("18A");
    addGame("18B");
    fs.writeFileSync("src/data/games/index.js", "");
    loadGame.mockReturnValue(game({ info: { title: "The Game" } }));

    const files = await printed(undefined, { all: true });

    expect(loadGame.mock.calls.map(([id]) => id).sort()).toEqual([
      "18A",
      "18B",
    ]);
    expect(files.filter((file) => file.includes("background"))).toEqual([
      "18A/the-game-background.pdf",
      "18B/the-game-background.pdf",
    ]);
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/^Games: 18., 18.$/),
    );
  });

  it("throws a usage error when the game does not exist", async () => {
    loadGame.mockImplementationOnce(() => {
      throw new UsageError("Game 18Missing not found");
    });

    await expect(print("18Missing", {})).rejects.toThrow(
      new UsageError("Game 18Missing not found"),
    );
    expect(chromium.launch).not.toHaveBeenCalled();
    expect(startServer).not.toHaveBeenCalled();
  });

  it("waits for the browser and closes it and the server", async () => {
    addGame("18Full");
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
    chromium.launch.mockRejectedValueOnce(new Error("no browser"));

    await expect(print("18Full", {})).rejects.toThrow("no browser");
    expect(mocks.server.close).toHaveBeenCalledOnce();
  });

  it("keeps going and exits 1 when some documents fail", async () => {
    addGame("18Empty");
    loadGame.mockReturnValue(
      game({
        companies: undefined,
        map: undefined,
        stock: undefined,
        tiles: undefined,
        tokens: undefined,
        trains: undefined,
        privates: undefined,
        players: undefined,
      }),
    );
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.session.failOnce("Page.printToPDF", new Error("timeout"));

    const files = await printed("18Empty", {});

    // All three documents were tried, the first did not get written
    expect(
      mocks.session.send.mock.calls.filter(
        ([method]) => method === "Page.printToPDF",
      ),
    ).toHaveLength(3);
    expect(files).toHaveLength(2);
    expect(error).toHaveBeenCalledWith(
      "Failed pdf/18test-background.pdf: timeout",
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/1 documents failed:\npdf\/18test-background.pdf/),
    );
    expect(process.exitCode).toBe(1);
    expect(mocks.browser.close).toHaveBeenCalledOnce();
  });

  it("only starts the server in debug mode", async () => {
    await print("18Full", { debug: true });

    expect(startServer).toHaveBeenCalledOnce();
    expect(fs.statSync("render").isDirectory()).toBe(true);
    expect(chromium.launch).not.toHaveBeenCalled();
    expect(mocks.server.close).not.toHaveBeenCalled();
  });
});
