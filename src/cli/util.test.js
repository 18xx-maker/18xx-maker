import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import express from "express";

import {
  UsageError,
  compileCompanies,
  compileCompanyShares,
  compileCompanyTokens,
  defaultConfig,
  loadGame,
  loadJSON,
  loadSchema,
  loadTiles,
  setup18xxGame,
  setup,
  setupB18,
  setupGame,
  startExpress,
} from "#cli/util";

const cwd = process.cwd();
let tmp;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-cli-util-"));
  process.chdir(tmp);
});

afterEach(() => {
  process.chdir(cwd);
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe("compileCompanyTokens", () => {
  const game = {
    tokenTypes: { default: ["Major"], minor: ["Minor"], big: ["A", "B"] },
  };

  it("gives minors without tokens the minor token type", () => {
    expect(compileCompanyTokens(game, [{ minor: true }])).toEqual([
      { minor: true, tokenType: "minor", tokens: ["Minor"] },
    ]);
  });

  it("gives companies without tokens the default token type", () => {
    expect(compileCompanyTokens(game, [{ abbrev: "A" }])).toEqual([
      { abbrev: "A", tokenType: "default", tokens: ["Major"] },
    ]);
  });

  it("expands a named token type", () => {
    expect(compileCompanyTokens(game, [{ tokens: "big" }])).toEqual([
      { tokenType: "big", tokens: ["A", "B"] },
    ]);
  });

  it("leaves explicit token lists alone", () => {
    const company = { tokens: ["X"] };
    expect(compileCompanyTokens(game, [company])[0]).toBe(company);
  });

  it("falls back to minor companies getting default tokens", () => {
    expect(
      compileCompanyTokens({ tokenTypes: { default: ["Major"] } }, [
        { minor: true },
      ]),
    ).toEqual([{ minor: true, tokenType: "default", tokens: ["Major"] }]);
  });

  it("handles missing companies", () => {
    expect(compileCompanyTokens(game, undefined)).toEqual([]);
  });
});

describe("compileCompanyShares", () => {
  const game = {
    shareTypes: { default: [20, 10], minor: [100], half: [50, 50] },
  };

  it("gives minors without shares the minor share type", () => {
    expect(compileCompanyShares(game, [{ minor: true }])).toEqual([
      { minor: true, shareType: "minor", shares: [100] },
    ]);
  });

  it("gives companies without shares the default share type", () => {
    expect(compileCompanyShares(game, [{}])).toEqual([
      { shareType: "default", shares: [20, 10] },
    ]);
  });

  it("expands a named share type", () => {
    expect(compileCompanyShares(game, [{ shares: "half" }])).toEqual([
      { shareType: "half", shares: [50, 50] },
    ]);
  });

  it("leaves companies alone when the game has no share types", () => {
    const company = { abbrev: "A" };
    expect(compileCompanyShares({}, [company])[0]).toBe(company);
  });
});

describe("compileCompanies", () => {
  it("compiles both shares and tokens of the game companies", () => {
    expect(
      compileCompanies({
        tokenTypes: { default: ["Major"] },
        shareTypes: { default: [20] },
        companies: [{ abbrev: "A" }],
      }),
    ).toEqual([
      {
        abbrev: "A",
        shareType: "default",
        shares: [20],
        tokenType: "default",
        tokens: ["Major"],
      },
    ]);
  });
});

describe("setup folders", () => {
  it("creates the render folder and tolerates it existing", () => {
    setup();
    setup();
    expect(fs.statSync("render").isDirectory()).toBe(true);
  });

  it("creates the game folder", () => {
    setup();
    setupGame("18Test");
    setupGame("18Test");
    expect(fs.statSync("render/18Test").isDirectory()).toBe(true);
  });

  it("creates the board18 folders", () => {
    setup();
    setupB18("18Test", "1.0");
    setupB18("18Test", "1.0");
    expect(
      fs.statSync("render/18Test/board18-18Test-1.0/18Test-1.0").isDirectory(),
    ).toBe(true);
  });

  it("creates the 18xx.games folders", () => {
    setup();
    setup18xxGame("18Test", "test");
    setup18xxGame("18Test", "test");
    expect(fs.statSync("render/18Test/18xx.games/test").isDirectory()).toBe(
      true,
    );
  });

  it("throws errors other than an existing folder", () => {
    // No render folder, so the game folder can't be made
    expect(() => setupGame("18Test")).toThrow(
      expect.objectContaining({ code: "ENOENT" }),
    );
  });
});

describe("loading", () => {
  it("loads json files", () => {
    fs.writeFileSync("test.json", '{"a":[1,2]}');
    expect(loadJSON("test.json")).toEqual({ a: [1, 2] });
  });

  it("throws on invalid json", () => {
    fs.writeFileSync("test.json", "{");
    expect(() => loadJSON("test.json")).toThrow(SyntaxError);
  });

  it("loads bundled games by name", () => {
    expect(loadGame("18Test").info.title).toBe("18Test");
  });

  it("throws a usage error for a game that does not exist", () => {
    expect(() => loadGame("18Missing")).toThrow(UsageError);
    expect(() => loadGame("18Missing")).toThrow("Game 18Missing not found");
  });

  it("loads schemas by filename", () => {
    expect(loadSchema("game.schema.json")).toHaveProperty("$id");
  });

  it("loads every tile color file in order", () => {
    const tiles = loadTiles();
    expect(tiles).toHaveLength(5);
    expect(tiles[0]["1"].color).toBe("yellow");
    expect(tiles[1]["14"].color).toBe("green");
  });

  it("loads the default config", () => {
    expect(defaultConfig.paper).toEqual({
      width: 850,
      height: 1100,
      margins: 25,
    });
  });
});

describe("custom config", () => {
  afterEach(() => {
    vi.doUnmock("node:fs");
    vi.resetModules();
  });

  it("reads src/config.json when it exists", async () => {
    vi.resetModules();
    vi.doMock("node:fs", async (importOriginal) => {
      const real = await importOriginal();
      const isConfig = (file) => file.endsWith(`src${path.sep}config.json`);
      const mocked = {
        ...real.default,
        existsSync: (file) => isConfig(file) || real.default.existsSync(file),
        readFileSync: (file, ...args) =>
          isConfig(file)
            ? '{"tiles":{"layout":"die"}}'
            : real.default.readFileSync(file, ...args),
      };
      return { ...mocked, default: mocked };
    });

    const { customConfig } = await import("#cli/util");
    expect(customConfig).toEqual({ tiles: { layout: "die" } });
  });
});

describe("startExpress", () => {
  let server;

  afterEach(async () => {
    vi.restoreAllMocks();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      server = undefined;
    }
  });

  it("serves index.html for any unknown route so the app can route it", async () => {
    // Echo the path that would be sent, dist/site may not be built
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(express.response, "sendFile").mockImplementation(function (file) {
      this.send(file);
    });

    server = startExpress(0);
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address();

    const response = await fetch(
      `http://localhost:${port}/games/18Test/map?print=true`,
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(
      path.join(import.meta.dirname, "../../dist/site/index.html"),
    );
  });

  it("is a usage error when the site is not built", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    expect(() => startExpress(0)).toThrow(UsageError);
    expect(() => startExpress(0)).toThrow("run pnpm build first");
  });
});
