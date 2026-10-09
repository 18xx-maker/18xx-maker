import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { chromium } from "playwright";

import b18 from "#cli/b18";
import exportCommand, {
  parseCardBleed,
  parseDpi,
  resolveGame,
  selectDocs,
} from "#cli/exportCommand";
import { UsageError, defaultConfig, loadGame, startServer } from "#cli/util";
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
    startServer: vi.fn(() => mocks.fake.server),
  };
});

const { loadGame: realLoadGame } = await vi.importActual("#cli/util");
const cwd = process.cwd();
let tmp;

// Where the files of 18Test are
const out = (...parts) => path.join(tmp, "render", "18Test", ...parts);
// The names in a folder, with the files of the pdf, png and svg folders of a
// game folder listed as if they were in it
const listing = (dir) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .flatMap((name) =>
          ["pdf", "png", "svg"].includes(name)
            ? fs.readdirSync(path.join(dir, name))
            : name,
        )
        .sort()
    : [];
const files = (dir = out()) => listing(dir);

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
  it("is a pdf of every page by default, paginated when it needs pages", async () => {
    await exportCommand("18Test", {});

    expect(files()).toEqual(
      expect.arrayContaining([
        "18test-map.pdf",
        "18test-map-paginated.pdf",
        "18test-market.pdf",
        "18test-tokens.pdf",
      ]),
    );
    expect(files().every((name) => name.endsWith(".pdf"))).toBe(true);
    // The par of 18Test fits on one page
    expect(files()).toContain("18test-par.pdf");
    expect(files()).not.toContain("18test-par-paginated.pdf");
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

  it("fails clearly when the formats have no file for the documents", async () => {
    await exportCommand("18Test", { format: "svg", docs: "cards" });

    expect(console.error).toHaveBeenCalledWith(
      "Nothing to export for 18Test: the chosen documents have no svg files",
    );
    expect(process.exitCode).toBe(1);
    expect(files()).toEqual([]);
  });

  it("exports an svg for each element with --format svg", async () => {
    await exportCommand("18Test", { format: "svg" });

    expect(files()).toEqual(
      expect.arrayContaining([
        "18test-map.svg",
        "18test-market.svg",
        "18test-tile-1.svg",
        "18test-token-1-BLRR.svg",
      ]),
    );
    expect(files().every((name) => name.endsWith(".svg"))).toBe(true);
    expect(fs.readFileSync(out("svg", "18test-map.svg"), "utf-8")).toBe(
      "<svg/>\n",
    );
    // No screenshot, no device size
    const methods = mocks.fake.session.send.mock.calls.map(([m]) => m);
    expect(methods).not.toContain("Page.captureScreenshot");
    expect(methods).not.toContain("Emulation.setDeviceMetricsOverride");
  });

  it("writes png at 300 dpi, with its resolution", async () => {
    await exportCommand("18Test", { format: "png", docs: "background" });

    expect(files()).toEqual(["18test-background.png"]);
    expect(
      readPng(
        new Uint8Array(fs.readFileSync(out("png", "18test-background.png"))),
      ),
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
      readPng(
        new Uint8Array(fs.readFileSync(out("png", "18test-background.png"))),
      ),
    ).toMatchObject({ pixelsPerMeter: 3780 });
    expect(mocks.fake.session.send).toHaveBeenCalledWith(
      "Emulation.setDeviceMetricsOverride",
      expect.objectContaining({ deviceScaleFactor: 1 }),
    );
  });

  it("has a white map, transparent with --background transparent, other images always transparent", async () => {
    const backgrounds = () =>
      mocks.fake.session.send.mock.calls
        .filter(([method, params]) => {
          return (
            method === "Emulation.setDefaultBackgroundColorOverride" && params
          );
        })
        .map(([, { color }]) => color.a);

    const docs = "map,background,tokens,tiles";
    for (const background of [undefined, "white"]) {
      mocks.fake.session.send.mockClear();
      await exportCommand("18Test", { format: "png", docs, background });
      // Only the map is white, the background page, tokens and tiles stay
      // transparent
      const alphas = backgrounds();
      expect(alphas.filter((a) => a === 1)).toHaveLength(1);
      expect(alphas.filter((a) => a === 0).length).toBeGreaterThan(2);
    }

    mocks.fake.session.send.mockClear();
    await exportCommand("18Test", {
      format: "png",
      docs,
      background: "transparent",
    });
    expect(backgrounds().length).toBeGreaterThan(3);
    expect(backgrounds().every((a) => a === 0)).toBe(true);
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

  it("puts each format in its own folder of the game", async () => {
    await exportCommand("18Test", { format: "pdf,png,svg,b18", docs: "map" });

    expect(files(out("pdf"))).toEqual([
      "18test-map-paginated.pdf",
      "18test-map.pdf",
    ]);
    expect(files(out("png"))).toEqual(["18test-map.png"]);
    expect(files(out("svg"))).toEqual(["18test-map.svg"]);
    expect(fs.readdirSync(out()).sort()).toEqual([
      "board18-18Test-1.0",
      "board18-18Test-1.0.zip",
      "pdf",
      "png",
      "svg",
    ]);
  });

  it("does all formats in one run", async () => {
    await exportCommand("18Test", { format: "pdf,png,b18", docs: "map" });

    expect(files()).toEqual([
      "18test-map-paginated.pdf",
      "18test-map.pdf",
      "18test-map.png",
      "board18-18Test-1.0",
      "board18-18Test-1.0.zip",
    ]);
  });

  it("goes to the page of the game that is given to the browser", async () => {
    await exportCommand("18Test", { docs: "map" });

    expect(urls()).toEqual([
      "http://localhost:1234/games/render:18Test/map",
      "http://localhost:1234/games/render:18Test/map?paginated=true",
    ]);
    const [, input] = mocks.fake.page.addInitScript.mock.calls[0];
    expect(input.id).toBe("18Test");
    expect(input.game.info.title).toBe("18Test");
    expect(input.config).toBeDefined();
  });

  it("puts the game folders in --out", async () => {
    await exportCommand("18Test", { docs: "map", out: "elsewhere/here" });

    expect(files(path.join(tmp, "elsewhere/here/18Test"))).toEqual([
      "18test-map-paginated.pdf",
      "18test-map.pdf",
    ]);
  });

  it("exits 1 and still writes the rest when documents fail", async () => {
    mocks.fake.session.failOnce("Page.printToPDF", new Error("crashed"));

    await exportCommand("18Test", { docs: "map,par" });

    expect(files()).toEqual(["18test-map-paginated.pdf", "18test-par.pdf"]);
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

  it("--layouts current exports the one layout, also when the config has every layout", async () => {
    fs.writeFileSync(
      "config.json",
      JSON.stringify({ export: { allLayouts: true } }),
    );

    await exportCommand("18Test", {
      docs: "cards",
      layouts: "current",
      config: "config.json",
    });

    // One sheet, of the layout the config has
    expect(files()).toEqual([`18test-cards-${defaultConfig.cards.layout}.pdf`]);
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

    // The par fits on one page, it has no paginated pdf
    expect(files()).toHaveLength(7);
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

  it("has every document, also the paginated ones", () => {
    expect(selectDocs(docs, {})).toEqual(docs);
  });

  it("selects by page, with the elements of a sheet in its name", () => {
    expect(selectDocs(docs, { docs: ["cards"] })).toEqual([docs[3], docs[4]]);
    expect(selectDocs(docs, { docs: ["tile-manifest"] })).toEqual([docs[5]]);
  });

  it("selects a map variation, the other documents are not hit", () => {
    expect(selectDocs(docs, { variation: 1 }).map((doc) => doc.kind)).toEqual([
      "map",
      "card",
      "cards",
      "tile-manifest",
    ]);
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

    expect(files()).toEqual([
      "18test-map-0-paginated.pdf",
      "18test-map-0.pdf",
      "18test-map-1-paginated.pdf",
      "18test-map-1.pdf",
    ]);
  });

  it("--variation only has one", async () => {
    withVariations();

    await exportCommand("18Test", { docs: "map", variation: "1" });

    expect(files()).toEqual(["18test-map-1-paginated.pdf", "18test-map-1.pdf"]);
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

  it("--background is transparent or white", async () => {
    expect.hasAssertions();
    await usage(
      "18Test",
      { background: "black" },
      "--background must be transparent or white",
    );
  });

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

  it("--card-bleed is 0 to 50", async () => {
    expect.hasAssertions();
    for (const cardBleed of ["51", "-1", "abc", ""]) {
      await usage(
        "18Test",
        { cardBleed },
        "--card-bleed must be a number from 0 to 50",
      );
    }
    expect(parseCardBleed("12.5")).toBe(12.5);
    expect(parseCardBleed("0")).toBe(0);
  });

  it("knows the formats and the pages", async () => {
    expect.hasAssertions();
    await usage(
      "18Test",
      { format: "pdf,gif" },
      "Unknown format gif, use pdf, png, svg, b18",
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

    expect(startServer).toHaveBeenCalledOnce();
    expect(chromium.launch).not.toHaveBeenCalled();
  });
});

describe("parseDpi", () => {
  it("takes 1 to 300", () => {
    expect(parseDpi("1")).toBe(1);
    expect(parseDpi("300")).toBe(300);
    expect(parseDpi(150)).toBe(150);
  });
});

describe("game files", () => {
  it("exports a game file, with its name as the id", async () => {
    const file = gameFile("my-game.json", { info: { title: "Mine" } });

    await exportCommand(file, { docs: "map" });

    expect(files(path.join(tmp, "render/my-game"))).toEqual([
      "mine-map-paginated.pdf",
      "mine-map.pdf",
    ]);
    expect(urls()[0]).toBe("http://localhost:1234/games/render:my-game/map");
    const [, input] = mocks.fake.page.addInitScript.mock.calls[0];
    expect(input.id).toBe("my-game");
  });

  it("takes a game file in another folder", async () => {
    fs.mkdirSync("games");
    fs.renameSync(gameFile("some-game.json"), "games/some-game.json");

    await exportCommand("games/some-game.json", { docs: "map" });

    expect(files(path.join(tmp, "render/some-game"))).toEqual([
      "18test-map-paginated.pdf",
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

  it("exports a game that still has removed fields, with a warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const base = JSON.parse(
      fs.readFileSync(path.join(cwd, "src/data/games/18Test.json"), "utf-8"),
    );
    const file = gameFile("old.json", {
      pools: [{ name: "Bank" }],
      trains: base.trains.map((train, i) =>
        i === 0 ? { ...train, discount: { 4: 300 } } : train,
      ),
    });

    await exportCommand(file, { docs: "map" });

    expect(files(path.join(tmp, "render/old"))).toEqual([
      "18test-map-paginated.pdf",
      "18test-map.pdf",
    ]);
    expect(warn.mock.calls.map(([line]) => line)).toEqual([
      `${file}: #/pools is a removed field, it is ignored`,
      `${file}: #/trains/0/discount is a removed field, it is ignored`,
    ]);
  });

  it("still does not export a removed field next to a real mistake", async () => {
    const file = gameFile("bad.json", { pools: [], info: { title: 5 } });

    await expect(exportCommand(file, {})).rejects.toThrow(
      /bad.json is not a valid game:\n#\/info\/title/,
    );
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

describe("the exports of a game file", () => {
  const exporting = (exports, name = "boxed.json") =>
    gameFile(name, { exports });
  const boxed = (...parts) => path.join(tmp, "render", "boxed", ...parts);
  const boxedFiles = (dir = boxed()) => listing(dir);

  it("sets every option of the export", async () => {
    const file = exporting({
      formats: ["png", "b18"],
      docs: ["background"],
      png: { dpi: 96 },
      b18: { version: "5.0", author: "The File" },
    });

    await exportCommand(file, {});

    expect(boxedFiles()).toEqual([
      "18test-background.png",
      "board18-boxed-5.0",
      "board18-boxed-5.0.zip",
    ]);
    expect(
      readPng(
        new Uint8Array(fs.readFileSync(boxed("png", "18test-background.png"))),
      ),
    ).toMatchObject({ pixelsPerMeter: 3780 });
    const json = JSON.parse(
      fs.readFileSync(boxed("board18-boxed-5.0/boxed-5.0.json"), "utf-8"),
    );
    expect(json).toMatchObject({ version: "5.0", author: "The File" });
  });

  it("sets every layout", async () => {
    const file = exporting({ docs: ["map", "cards"], layouts: "all" });

    await exportCommand(file, {});

    expect(boxedFiles()).toEqual(
      expect.arrayContaining([
        "18test-map-paginated.pdf",
        "18test-cards-free.pdf",
      ]),
    );
  });

  it("sets the map variation", async () => {
    const base = JSON.parse(
      fs.readFileSync(path.join(cwd, "src/data/games/18Test.json"), "utf-8"),
    );
    const file = gameFile("boxed.json", {
      map: [base.map, base.map],
      exports: { docs: ["map"], variation: 1 },
    });

    await exportCommand(file, {});
    expect(boxedFiles()).toEqual([
      "18test-map-1-paginated.pdf",
      "18test-map-1.pdf",
    ]);

    fs.writeFileSync(
      file,
      JSON.stringify({ ...base, map: [base.map], exports: { variation: 1 } }),
    );
    await expect(exportCommand(file, {})).rejects.toThrow(
      "boxed has no map variation 1",
    );
  });

  it("is overridden by the flags", async () => {
    const file = exporting({
      formats: ["png"],
      docs: ["map", "tokens"],
      png: { dpi: 96 },
    });

    await exportCommand(file, { format: "pdf", docs: "map" });
    expect(boxedFiles()).toEqual([
      "18test-map-paginated.pdf",
      "18test-map.pdf",
    ]);

    fs.rmSync(boxed(), { recursive: true });
    await exportCommand(file, { docs: "background", dpi: "150" });
    expect(boxedFiles()).toEqual(["18test-background.png"]);
    expect(
      readPng(
        new Uint8Array(fs.readFileSync(boxed("png", "18test-background.png"))),
      ),
    ).toMatchObject({ pixelsPerMeter: 5906 });
  });

  it("has the layout of the flag over every layout of the game", async () => {
    const file = exporting({ docs: ["cards"], layouts: "all" });

    await exportCommand(file, { layouts: "current" });

    expect(boxedFiles()).toEqual([
      `18test-cards-${defaultConfig.cards.layout}.pdf`,
    ]);
  });

  it("has the map variation of the flag over the one of the game", async () => {
    const base = JSON.parse(
      fs.readFileSync(path.join(cwd, "src/data/games/18Test.json"), "utf-8"),
    );
    const file = gameFile("boxed.json", {
      map: [base.map, base.map],
      exports: { docs: ["map"], variation: 1 },
    });

    await exportCommand(file, { variation: "0" });

    expect(boxedFiles()).toEqual([
      "18test-map-0-paginated.pdf",
      "18test-map-0.pdf",
    ]);
  });

  it("exports every map variation with --variation all", async () => {
    const base = JSON.parse(
      fs.readFileSync(path.join(cwd, "src/data/games/18Test.json"), "utf-8"),
    );
    const file = gameFile("boxed.json", {
      map: [base.map, base.map],
      exports: { docs: ["map"], variation: 1 },
    });

    await exportCommand(file, { variation: "all" });

    expect(boxedFiles()).toEqual([
      "18test-map-0-paginated.pdf",
      "18test-map-0.pdf",
      "18test-map-1-paginated.pdf",
      "18test-map-1.pdf",
    ]);
  });

  it("has the box of the game for maker b18 without a version or author", async () => {
    const file = exporting({
      formats: ["pdf"],
      b18: { version: "5.0", author: "The File" },
    });

    await b18(file, undefined, undefined, {});

    const json = JSON.parse(
      fs.readFileSync(boxed("board18-boxed-5.0/boxed-5.0.json"), "utf-8"),
    );
    expect(json).toMatchObject({ version: "5.0", author: "The File" });
  });

  it("has the box of the flags over the box of the game", async () => {
    const file = exporting({
      formats: ["b18"],
      b18: { version: "5.0", author: "The File" },
    });

    await exportCommand(file, { b18Version: "6.0", b18Author: "Flag" });

    const json = JSON.parse(
      fs.readFileSync(boxed("board18-boxed-6.0/boxed-6.0.json"), "utf-8"),
    );
    expect(json).toMatchObject({ version: "6.0", author: "Flag" });
  });

  it("is overridden by the config of the user", async () => {
    const file = exporting({ docs: ["cards"], layouts: "all" });
    fs.writeFileSync(
      "config.json",
      JSON.stringify({ export: { allLayouts: false } }),
    );

    await exportCommand(file, { config: "config.json" });

    expect(boxedFiles()).toEqual([
      `18test-cards-${defaultConfig.cards.layout}.pdf`,
    ]);
  });

  it("is not valid with a resolution over 300 dpi", async () => {
    const file = exporting({ png: { dpi: 301 } });

    await expect(exportCommand(file, {})).rejects.toThrow(
      /boxed.json is not a valid game:\n#\/exports\/png\/dpi .*should be .300. at maximum/,
    );
    expect(chromium.launch).not.toHaveBeenCalled();
  });

  it("is not valid with an option it does not have", async () => {
    await expect(
      exportCommand(exporting({ formats: ["gif"] }), {}),
    ).rejects.toThrow(/#\/exports\/formats\/0/);
    await expect(
      exportCommand(exporting({ pdf: { size: "A4" } }), {}),
    ).rejects.toThrow(/#\/exports/);
  });
});

describe("custom images", () => {
  const STAR = '<svg viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';
  // The assets the page is given
  const given = () => mocks.fake.page.addInitScript.mock.calls[0][1].assets;
  const folder = (dir, name = "star", svg = STAR) => {
    fs.mkdirSync(path.join(dir, "icons"), { recursive: true });
    fs.writeFileSync(path.join(dir, "icons", `${name}.svg`), svg);
    return dir;
  };

  it("gives the page the images of a bundled game and says how many", async () => {
    await exportCommand("18Test", { docs: "map" });

    expect(Object.keys(given().icons)).toEqual(["star"]);
    expect(Object.keys(given().logos)).toEqual(["crest"]);
    expect(Object.keys(given().trains)).toEqual(["loco"]);
    expect(given().trains.loco).toMatch(/^data:image\/png;base64,/);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(
        /^Assets: 3 custom images for 18Test from .*18Test\.assets$/,
      ),
    );
  });

  it("reads <name>.assets next to a game file", async () => {
    const file = gameFile("mine.json");
    folder(path.join(tmp, "mine.assets"), "moon");

    await exportCommand(file, { docs: "map" });

    expect(Object.keys(given().icons)).toEqual(["moon"]);
  });

  it("gives an empty set and says nothing for a game without a folder", async () => {
    const file = gameFile("plain.json");

    await exportCommand(file, { docs: "map" });

    expect(Object.keys(given().icons)).toEqual([]);
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringMatching(/^Assets:/),
    );
  });

  it("takes the folder of --assets instead", async () => {
    const file = gameFile("mine.json");
    folder(path.join(tmp, "mine.assets"), "moon");
    folder(path.join(tmp, "elsewhere"), "sun");

    await exportCommand(file, { docs: "map", assets: "elsewhere" });

    expect(Object.keys(given().icons)).toEqual(["sun"]);
  });

  it("uses no images with --no-assets", async () => {
    await exportCommand("18Test", { docs: "map", assets: false });

    expect(given()).toBeUndefined();
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringMatching(/^Assets:/),
    );
  });

  it("warns about a file that is not taken and exports the rest", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const file = gameFile("mine.json");
    const dir = folder(path.join(tmp, "mine.assets"));
    fs.writeFileSync(path.join(dir, "icons", "bad name.svg"), STAR);

    await exportCommand(file, { docs: "map" });

    expect(Object.keys(given().icons)).toEqual(["star"]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(
        /^Warning: .*bad name\.svg: the name is not usable/,
      ),
    );
  });

  it("does not run with a --assets folder that is not there", async () => {
    await expect(
      exportCommand("18Test", { assets: "missing" }),
    ).rejects.toThrow(/missing not found/);
    expect(chromium.launch).not.toHaveBeenCalled();
  });

  it("does not take --assets for every game", async () => {
    folder(path.join(tmp, "elsewhere"));
    await expect(
      exportCommand(undefined, { all: true, assets: "elsewhere" }),
    ).rejects.toThrow(/--assets is the folder of one game/);
  });
});
