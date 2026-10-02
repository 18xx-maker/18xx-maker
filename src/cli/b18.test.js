import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ZipArchive } from "archiver";
import { chromium } from "playwright";

import b18 from "#cli/b18";
import { defaultConfig, loadGame, startExpress } from "#cli/util";

const mocks = await vi.hoisted(async () => {
  const { EventEmitter } = await import("node:events");
  const page = {
    goto: vi.fn(),
    emulateMedia: vi.fn(),
    setViewportSize: vi.fn(),
    screenshot: vi.fn(),
  };
  const browser = { newPage: vi.fn(() => page), close: vi.fn() };
  const server = { close: vi.fn() };
  const archive = Object.assign(new EventEmitter(), {
    pipe: vi.fn(),
    directory: vi.fn(),
    finalize: vi.fn(),
  });
  // Like the real zip, the output stream only closes after it was finalized
  const output = Object.assign(new EventEmitter(), { file: "" });
  return { page, browser, server, archive, output };
});

vi.mock("playwright", () => ({
  chromium: { launch: vi.fn(() => mocks.browser) },
}));

vi.mock("archiver", () => ({
  ZipArchive: vi.fn(function () {
    return mocks.archive;
  }),
}));

// Don't open the zip file, the stream would outlive the temp folder
vi.mock("node:fs", async (importOriginal) => {
  const real = await importOriginal();
  const mocked = {
    ...real.default,
    createWriteStream: vi.fn((file) => {
      mocks.output.file = file;
      return mocks.output;
    }),
  };
  return { ...mocked, default: mocked };
});

vi.mock("#cli/util", async (importOriginal) => {
  const real = await importOriginal();
  return {
    ...real,
    loadGame: vi.fn(real.loadGame),
    startExpress: vi.fn(() => mocks.server),
  };
});

const cwd = process.cwd();
const folder = "render/18Test/board18-18Test-1.0";
let tmp;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.archive.removeAllListeners();
  mocks.output.removeAllListeners();
  mocks.archive.finalize.mockImplementation(() =>
    setTimeout(() => mocks.output.emit("close"), 10),
  );
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-cli-b18-"));
  process.chdir(tmp);
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
  process.chdir(cwd);
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe("b18", () => {
  describe("18Test box", () => {
    let json;
    let screenshots;

    beforeEach(async () => {
      await b18("18Test", "1.0", "Pat", {});
      json = JSON.parse(fs.readFileSync(`${folder}/18Test-1.0.json`, "utf-8"));
      screenshots = mocks.page.screenshot.mock.calls.map(([options], i) => ({
        url: mocks.page.goto.mock.calls[i][0],
        size: mocks.page.setViewportSize.mock.calls[i][0],
        ...options,
      }));
    });

    it("writes the box metadata", () => {
      expect(json).toMatchObject({ bname: "18Test", version: "1.0" });
      expect(json.author).toBe("Pat");
      expect(json.board).toMatchObject({
        imgLoc: "images/18Test-1.0/Map.png",
        orientation: "P",
        xStep: 50,
        yStep: 87,
        yStart: 50,
      });
      expect(json.market.imgLoc).toBe("images/18Test-1.0/Market.png");
    });

    it("links to bgg and the rules", () => {
      expect(json.links).toEqual([
        {
          link_name: "18Test on BGG",
          link_url: "https://boardgamegeek.com/boardgamefamily/19/18xx",
        },
        {
          link_name: "Rules",
          link_url: "https://boardgamegeek.com/wiki/page/18xx",
        },
      ]);
    });

    it("makes a tile tray per tile color", () => {
      const tiles = json.tray.filter((tray) => tray.type === "tile");
      expect(tiles.map((tray) => tray.tName)).toEqual(
        tiles.map(() => expect.stringMatching(/^[A-Z][a-z/]* Tiles$/)),
      );
      // 18Test has two yellow tiles: 1 and 57 (aliased as 2, quantity 2,
      // with 3 rotations)
      const yellow = tiles.find((tray) => tray.tName === "Yellow Tiles");
      expect(yellow).toMatchObject({
        imgLoc: "images/18Test-1.0/Yellow.png",
        xSize: 100,
        ySize: 116,
      });
      expect(yellow.tile).toEqual([
        { rots: 6, dups: 1 },
        { rots: 3, dups: 2 },
      ]);
    });

    it("makes token trays for every company and extra token", () => {
      const btok = json.tray.find((tray) => tray.type === "btok");
      const mtok = json.tray.find((tray) => tray.type === "mtok");
      // 20 companies with one token each, then the 16 extra tokens
      expect(btok.token).toHaveLength(36);
      expect(btok.token[0]).toEqual({ dups: 1, flip: true });
      expect(btok.token[20]).toEqual({ dups: 1, flip: true });
      expect(mtok.token).toHaveLength(20);
      expect(mtok.token[0]).toEqual({ flip: true });
    });

    it("screenshots the map, market, tokens and each tile color", () => {
      const tileTrays = json.tray.filter((tray) => tray.type === "tile");
      expect(screenshots.map((shot) => shot.path)).toEqual([
        `${folder}/18Test-1.0/Map.png`,
        `${folder}/18Test-1.0/Market.png`,
        `${folder}/18Test-1.0/Tokens.png`,
        ...tileTrays.map(
          (tray) => `${folder}/${tray.imgLoc.replace("images/", "")}`,
        ),
      ]);
      expect(screenshots[0].url).toBe(
        "http://localhost:9000/games/18Test/b18/map?print=true",
      );
      expect(screenshots[0].omitBackground).toBe(false);
      // Tokens are 30 pixels for each company and extra token
      expect(screenshots[2].size).toEqual({ width: 60, height: 30 * 36 });
      expect(screenshots[2].omitBackground).toBe(true);
      expect(screenshots[3].url).toBe(
        `http://localhost:9000/games/18Test/b18/tiles/${tileTrays[0].tName.split(" ")[0].toLowerCase()}?print=true`,
      );
      expect(screenshots[3].size.height).toBe(900);
      expect(mocks.page.emulateMedia).toHaveBeenCalledWith({ media: "print" });
    });

    it("closes the browser and server and zips the box", () => {
      expect(mocks.browser.close).toHaveBeenCalledOnce();
      expect(mocks.server.close).toHaveBeenCalledOnce();
      expect(ZipArchive).toHaveBeenCalledWith({ zlib: { level: 9 } });
      expect(mocks.archive.directory).toHaveBeenCalledWith(
        folder,
        "board18-18Test-1.0",
      );
      expect(mocks.archive.finalize).toHaveBeenCalledOnce();
      expect(mocks.archive.pipe).toHaveBeenCalledWith(mocks.output);
      expect(mocks.output.file).toBe(`${folder}.zip`);
    });
  });

  it("handles horizontal maps, 1D markets and token quantities", async () => {
    const game = loadGame("18Test");
    loadGame.mockReturnValueOnce({
      ...game,
      info: { ...game.info, orientation: "horizontal", extraStationTokens: 2 },
      links: undefined,
      stock: { ...game.stock, type: "1D", title: false },
      tiles: { 1: "∞", 57: { quantity: 2, rotations: [0, 1] } },
      tokens: [{ quantity: 0 }, { quantity: "∞" }, { quantity: 3 }, "Round"],
    });

    await b18("18Test", "1.0", "Pat", {});
    const json = JSON.parse(
      fs.readFileSync(`${folder}/18Test-1.0.json`, "utf-8"),
    );

    expect(json.board).toMatchObject({
      orientation: "F",
      xStep: 87,
      yStep: 50,
    });
    expect(json.links).toEqual([]);
    const { cell, column } = defaultConfig.stock;
    expect(json.market.yStart).toBeCloseTo(25 * 0.96);
    expect(json.market.yStep).toBeCloseTo(cell.height * column * 0.96);

    const [yellow, btok] = json.tray;
    expect(yellow).toMatchObject({ tName: "Yellow Tiles", xSize: 116 });
    expect(yellow.tile).toEqual([
      // "∞" quantity is the special value 0
      { rots: 6, dups: 0 },
      { rots: 2, dups: 2 },
    ]);
    // Companies get the extra station tokens, quantity 0 tokens are removed
    expect(btok.token[0]).toEqual({ dups: 3, flip: true });
    expect(btok.token.slice(20)).toEqual([
      { dups: 0, flip: true },
      { dups: 3, flip: true },
      { dups: 1, flip: true },
    ]);
    expect(mocks.page.setViewportSize).toHaveBeenCalledWith({
      width: 60,
      height: 30 * 23,
    });
  });

  it("waits for the zip file to be written", async () => {
    let closed = false;
    mocks.archive.finalize.mockImplementation(() =>
      setTimeout(() => {
        closed = true;
        mocks.output.emit("close");
      }, 20),
    );

    await b18("18Test", "1.0", "Pat", {});

    expect(closed).toBe(true);
  });

  it("fails when the zip cannot be written", async () => {
    mocks.archive.finalize.mockImplementation(() =>
      setTimeout(() => mocks.output.emit("error", new Error("disk full")), 1),
    );

    await expect(b18("18Test", "1.0", "Pat", {})).rejects.toThrow("disk full");
  });

  it("closes the browser and server when a step throws", async () => {
    chromium.launch.mockRejectedValueOnce(new Error("no browser"));

    await expect(b18("18Test", "1.0", "Pat", {})).rejects.toThrow("no browser");
    expect(mocks.server.close).toHaveBeenCalledOnce();
    expect(mocks.archive.finalize).not.toHaveBeenCalled();
  });

  it("keeps going and exits 1 when some images fail", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.page.screenshot.mockRejectedValueOnce(new Error("timeout"));

    await b18("18Test", "1.0", "Pat", {});

    expect(mocks.page.screenshot.mock.calls.length).toBeGreaterThan(3);
    expect(error).toHaveBeenCalledWith("Failed Map.png: timeout");
    expect(process.exitCode).toBe(1);
    expect(mocks.archive.finalize).toHaveBeenCalledOnce();
    expect(mocks.browser.close).toHaveBeenCalledOnce();
  });

  it("throws a usage error for a game that does not exist", async () => {
    await expect(b18("18Missing", "1.0", "Pat", {})).rejects.toThrow(
      "Game 18Missing not found",
    );
    expect(startExpress).not.toHaveBeenCalled();
  });

  it("only starts the server in debug mode", async () => {
    await b18("18Test", "1.0", "Pat", { debug: true });

    expect(startExpress).toHaveBeenCalledOnce();
    expect(fs.statSync("render").isDirectory()).toBe(true);
    expect(chromium.launch).not.toHaveBeenCalled();
    expect(fs.existsSync(folder)).toBe(false);
  });
});
