import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { chromium } from "playwright";

import exportCommand, {
  parseDpi,
  resolveGame,
  selectDocs,
} from "#cli/exportCommand";
import { UsageError, loadGame, startExpress } from "#cli/util";
import { readPng } from "#export/png";
import { createFakeBrowser } from "./__fixtures__/browser.js";

const mocks = await vi.hoisted(async () => {
  const { createFakeBrowser: create } =
    await import("./__fixtures__/browser.js");
  return { fake: create() };
});

vi.mock("playwright", () => ({
  chromium: { launch: vi.fn(() => mocks.fake.browser) },
}));

vi.mock("#cli/util", async (importOriginal) => {
  const real = await importOriginal();
  return {
    ...real,
    loadGame: vi.fn(real.loadGame),
    startExpress: vi.fn(() => mocks.fake.server),
  };
});

const { loadGame: realLoadGame } = await vi.importActual("#cli/util");
const cwd = process.cwd();
let tmp;

// Where the files of 18Test are
const out = (...parts) => path.join(tmp, "render", "18Test", ...parts);
const files = (dir = out()) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).sort() : [];

// The urls the browser went to
const urls = () => mocks.fake.page.goto.mock.calls.map(([url]) => url);

// A game file next to the output
const gameFile = (name, changes = {}) => {
  const file = path.join(tmp, name);
  const game = {
    ...JSON.parse(
      fs.readFileSync(path.join(cwd, "src/data/games/18Test.json"), "utf-8"),
    ),
    ...changes,
  };
  fs.writeFileSync(file, JSON.stringify(game));
  return file;
};

beforeEach(() => {
  vi.clearAllMocks();
  loadGame.mockImplementation(realLoadGame);
  Object.assign(mocks.fake, createFakeBrowser());
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-cli-export-cmd-"));
  process.chdir(tmp);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
  process.chdir(cwd);
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe("export formats", () => {
  it("is a pdf of every page by default, without the paginated ones", async () => {
    await exportCommand("18Test", {});

    expect(files()).toEqual(
      expect.arrayContaining([
        "18test-map.pdf",
        "18test-market.pdf",
        "18test-tokens.pdf",
      ]),
    );
    expect(files().every((name) => name.endsWith(".pdf"))).toBe(true);
    expect(files().some((name) => name.includes("paginated"))).toBe(false);
  });

  it("has the paginated pdfs with --paginated", async () => {
    await exportCommand("18Test", { paginated: true });

    expect(files()).toContain("18test-map-paginated.pdf");
  });

  it("exports a png for each element with --format png", async () => {
    await exportCommand("18Test", { format: "png" });

    expect(files()).toEqual(
      expect.arrayContaining([
        "18test-map.png",
        "18test-card-train-1-2.png",
        "18test-token-1-BLRR.png",
        "18test-tile-1.png",
      ]),
    );
    expect(files().some((name) => name.endsWith(".pdf"))).toBe(false);
  });

  it("writes png at 300 dpi, with its resolution", async () => {
    await exportCommand("18Test", { format: "png", docs: "background" });

    expect(files()).toEqual(["18test-background.png"]);
    expect(
      readPng(new Uint8Array(fs.readFileSync(out("18test-background.png")))),
    ).toMatchObject({ pixelsPerMeter: 11811 });
    expect(mocks.fake.session.send).toHaveBeenCalledWith(
      "Emulation.setDeviceMetricsOverride",
      expect.objectContaining({ deviceScaleFactor: 3.125 }),
    );
  });

  it("writes png at a lower dpi", async () => {
    await exportCommand("18Test", {
      format: "png",
      docs: "background",
      dpi: "96",
    });

    expect(
      readPng(new Uint8Array(fs.readFileSync(out("18test-background.png")))),
    ).toMatchObject({ pixelsPerMeter: 3780 });
    expect(mocks.fake.session.send).toHaveBeenCalledWith(
      "Emulation.setDeviceMetricsOverride",
      expect.objectContaining({ deviceScaleFactor: 1 }),
    );
  });

  it("makes a board 18 box with --format b18", async () => {
    await exportCommand("18Test", {
      format: "b18",
      b18Version: "2.1",
      b18Author: "Pat",
    });

    expect(files()).toEqual(["board18-18Test-2.1", "board18-18Test-2.1.zip"]);
    const json = JSON.parse(
      fs.readFileSync(out("board18-18Test-2.1/18Test-2.1.json"), "utf-8"),
    );
    expect(json).toMatchObject({
      bname: "18Test",
      version: "2.1",
      author: "Pat",
    });
    expect(files(out("board18-18Test-2.1/18Test-2.1"))).toContain("Map.png");
  });

  it("b18 images keep one pixel per unit, without a resolution", async () => {
    await exportCommand("18Test", { format: "b18" });

    const map = out("board18-18Test-1.0/18Test-1.0/Map.png");
    expect(readPng(new Uint8Array(fs.readFileSync(map))).pixelsPerMeter).toBe(
      null,
    );
    const sizes = mocks.fake.session.send.mock.calls
      .filter(([method]) => method === "Emulation.setDeviceMetricsOverride")
      .map(([, params]) => params.deviceScaleFactor);
    expect(new Set(sizes)).toEqual(new Set([1]));
  });

  it("does all formats in one run", async () => {
    await exportCommand("18Test", { format: "pdf,png,b18", docs: "map" });

    expect(files()).toEqual([
      "18test-map.pdf",
      "18test-map.png",
      "board18-18Test-1.0",
      "board18-18Test-1.0.zip",
    ]);
  });

  it("goes to the page of the game that is given to the browser", async () => {
    await exportCommand("18Test", { docs: "map" });

    expect(urls()).toEqual(["http://localhost:1234/games/render:18Test/map"]);
    const [, input] = mocks.fake.page.addInitScript.mock.calls[0];
    expect(input.id).toBe("18Test");
    expect(input.game.info.title).toBe("18Test");
    expect(input.config).toBeDefined();
  });

  it("puts the game folders in --out", async () => {
    await exportCommand("18Test", { docs: "map", out: "elsewhere/here" });

    expect(files(path.join(tmp, "elsewhere/here/18Test"))).toEqual([
      "18test-map.pdf",
    ]);
  });

  it("exits 1 and still writes the rest when documents fail", async () => {
    mocks.fake.session.failOnce("Page.printToPDF", new Error("crashed"));

    await exportCommand("18Test", { docs: "map,market" });

    expect(files()).toEqual(["18test-market.pdf"]);
    expect(process.exitCode).toBe(1);
  });
});

describe("export options", () => {
  it("--docs takes the pages and the elements of them", async () => {
    await exportCommand("18Test", { format: "pdf,png", docs: "charters,par" });

    const names = files();
    expect(names).toContain("18test-charters.pdf");
    expect(names).toContain("18test-charter-1-BLRR.png");
    expect(names).toContain("18test-par.pdf");
    expect(names).toContain("18test-par.png");
    expect(names.some((name) => name.includes("map"))).toBe(false);
    expect(names.some((name) => name.includes("token"))).toBe(false);
  });

  it("--layouts all has a sheet for every layout", async () => {
    await exportCommand("18Test", { docs: "cards", layouts: "all" });

    expect(files().length).toBeGreaterThan(1);
    expect(files()).toContain("18test-cards-miniEuroDie.pdf");
    expect(urls().some((url) => url.includes("config.cards.layout="))).toBe(
      true,
    );
  });

  it("--config changes the config of the export and of the page", async () => {
    fs.writeFileSync(
      "config.json",
      JSON.stringify({ cards: { layout: "dtgDie" } }),
    );

    await exportCommand("18Test", { docs: "cards", config: "config.json" });

    expect(files()).toEqual(["18test-cards-dtgDie.pdf"]);
    const [, input] = mocks.fake.page.addInitScript.mock.calls[0];
    expect(input.config.cards).toEqual({ layout: "dtgDie" });
  });

  it("--config must be a config", async () => {
    fs.writeFileSync("config.json", "[]");
    fs.writeFileSync("broken.json", "{");

    await expect(
      exportCommand("18Test", { config: "config.json" }),
    ).rejects.toThrow("config.json is not a config, it must be a JSON object");
    await expect(
      exportCommand("18Test", { config: "broken.json" }),
    ).rejects.toThrow(/broken.json is not valid JSON/);
    await expect(
      exportCommand("18Test", { config: "missing.json" }),
    ).rejects.toThrow(new UsageError("missing.json not found"));
    expect(chromium.launch).not.toHaveBeenCalled();
  });

  it("--jobs captures with that many pages", async () => {
    await exportCommand("18Test", {
      docs: "map,market,par,revenue",
      jobs: "3",
    });

    expect(files()).toHaveLength(4);
    expect(mocks.fake.browser.newPage.mock.calls.length).toBeGreaterThan(1);
    expect(mocks.fake.browser.newPage.mock.calls.length).toBeLessThanOrEqual(3);
  });

  it("is one page with the default of one job", async () => {
    await exportCommand("18Test", { docs: "map,market,par,revenue" });

    expect(mocks.fake.browser.newPage).toHaveBeenCalledOnce();
  });
});

describe("selectDocs", () => {
  const docs = [
    { kind: "map", mode: "single", variation: 0 },
    { kind: "map", mode: "paginated", variation: 0 },
    { kind: "map", mode: "single", variation: 1 },
    { kind: "card", mode: "item" },
    { kind: "cards", mode: "single" },
    { kind: "tile-manifest", mode: "single" },
  ];

  it("has everything but the paginated documents", () => {
    expect(selectDocs(docs, {})).toHaveLength(5);
    expect(selectDocs(docs, { paginated: true })).toHaveLength(6);
  });

  it("selects by page, with the elements of a sheet in its name", () => {
    expect(selectDocs(docs, { docs: ["cards"] })).toEqual([docs[3], docs[4]]);
    expect(selectDocs(docs, { docs: ["tile-manifest"] })).toEqual([docs[5]]);
  });

  it("selects a map variation, the other documents are not hit", () => {
    expect(
      selectDocs(docs, { variation: 1, paginated: true }).map(
        (doc) => doc.kind,
      ),
    ).toEqual(["map", "card", "cards", "tile-manifest"]);
  });
});

describe("export of a map with variations", () => {
  const withVariations = () => {
    const game = loadGame("18Test");
    loadGame.mockReturnValue({ ...game, map: [game.map, game.map] });
  };

  it("has a map of each variation", async () => {
    withVariations();

    await exportCommand("18Test", { docs: "map" });

    expect(files()).toEqual(["18test-map-0.pdf", "18test-map-1.pdf"]);
  });

  it("--variation only has one", async () => {
    withVariations();

    await exportCommand("18Test", { docs: "map", variation: "1" });

    expect(files()).toEqual(["18test-map-1.pdf"]);
  });

  it("--variation must be there", async () => {
    withVariations();

    await expect(
      exportCommand("18Test", { docs: "map", variation: "2" }),
    ).rejects.toThrow(new UsageError("18Test has no map variation 2"));
    expect(chromium.launch).not.toHaveBeenCalled();
  });

  it("b18 takes the variation", async () => {
    withVariations();

    await exportCommand("18Test", { format: "b18", variation: "1" });

    expect(urls()[0]).toBe(
      "http://localhost:1234/games/render:18Test/b18/map?variation=1&print=true",
    );
  });
});

describe("export usage errors", () => {
  // Nothing is started and no folder is made
  const usage = async (game, opts, message) => {
    const run = () => exportCommand(game, opts);
    await expect(run()).rejects.toThrow(UsageError);
    await expect(run()).rejects.toThrow(message);
    expect(chromium.launch).not.toHaveBeenCalled();
    expect(fs.existsSync("render")).toBe(false);
  };

  it("--dpi is 1 to 300", async () => {
    expect.hasAssertions();
    await usage(
      "18Test",
      { dpi: "301" },
      "--dpi 301 is too high, the highest resolution is 300",
    );
    await usage(
      "18Test",
      { dpi: "0" },
      "--dpi must be a whole number from 1 to 300",
    );
    await usage(
      "18Test",
      { dpi: "abc" },
      "--dpi must be a whole number from 1 to 300",
    );
    await usage("18Test", { dpi: "150.5" }, "--dpi must be a whole number");
  });

  it("knows the formats and the pages", async () => {
    expect.hasAssertions();
    await usage(
      "18Test",
      { format: "pdf,gif" },
      "Unknown format gif, use pdf, png, b18",
    );
    await usage(
      "18Test",
      { docs: "map,nope" },
      "Unknown page nope, use background",
    );
    await usage(
      "18Test",
      { layouts: "some" },
      "--layouts must be all or current",
    );
  });

  it("needs a game, or --all", async () => {
    expect.hasAssertions();
    await usage(undefined, {}, "Name a game or a game file, or use --all");
    await usage("18Test", { all: true }, "Use a game or --all, not both");
  });

  it("wants whole numbers for --jobs and --variation", async () => {
    expect.hasAssertions();
    await usage("18Test", { jobs: "0" }, "--jobs must be a whole number");
    await usage(
      "18Test",
      { variation: "x" },
      "--variation must be a whole number",
    );
  });

  it("does not know the game", async () => {
    loadGame.mockImplementationOnce(() => {
      throw new UsageError("Game 18Missing not found");
    });

    await expect(exportCommand("18Missing", {})).rejects.toThrow(
      "Game 18Missing not found",
    );
  });

  it("only serves the site in debug mode, whatever else is wrong", async () => {
    await exportCommand(undefined, { debug: true });

    expect(startExpress).toHaveBeenCalledOnce();
    expect(chromium.launch).not.toHaveBeenCalled();
  });
});

describe("parseDpi", () => {
  it("is 300 by default and takes 1 to 300", () => {
    expect(parseDpi()).toBe(300);
    expect(parseDpi("1")).toBe(1);
    expect(parseDpi("300")).toBe(300);
    expect(parseDpi(150)).toBe(150);
  });
});

describe("game files", () => {
  it("exports a game file, with its name as the id", async () => {
    const file = gameFile("my-game.json", { info: { title: "Mine" } });

    await exportCommand(file, { docs: "map" });

    expect(files(path.join(tmp, "render/my-game"))).toEqual(["mine-map.pdf"]);
    expect(urls()).toEqual(["http://localhost:1234/games/render:my-game/map"]);
    const [, input] = mocks.fake.page.addInitScript.mock.calls[0];
    expect(input.id).toBe("my-game");
  });

  it("takes a game file in another folder", async () => {
    fs.mkdirSync("games");
    fs.renameSync(gameFile("some-game.json"), "games/some-game.json");

    await exportCommand("games/some-game.json", { docs: "map" });

    expect(files(path.join(tmp, "render/some-game"))).toEqual([
      "18test-map.pdf",
    ]);
  });

  it("does not export a game that is not valid", async () => {
    const file = gameFile("bad.json", { info: { title: 5 } });

    await expect(exportCommand(file, {})).rejects.toThrow(
      /bad.json is not a valid game:\n#\/info\/title/,
    );
    expect(chromium.launch).not.toHaveBeenCalled();
  });

  it("does not export what is not json", async () => {
    fs.writeFileSync("broken.json", "{");

    await expect(exportCommand("broken.json", {})).rejects.toThrow(
      /broken.json is not a valid game/,
    );
    await expect(exportCommand("missing.json", {})).rejects.toThrow(
      new UsageError("missing.json not found"),
    );
  });

  it("knows a bundled game from a path", async () => {
    expect(await resolveGame("18Test")).toMatchObject({ id: "18Test" });
    expect(loadGame).toHaveBeenCalledWith("18Test");
    expect(await resolveGame(gameFile("x.json"))).toMatchObject({ id: "x" });
  });
});
