import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";

import { compileSchema, draft07 } from "json-schema-library";

import { omit } from "ramda";

import validate from "#cli/validate";

import {
  bothGame,
  deprecatedGame,
  renamedGame,
} from "@tests/support/deprecatedGame.js";

const root = path.join(import.meta.dirname, "../..");
const src = (file) => path.join(root, "src", file);

let tmp;
let exit;
let write;

const writeTmp = (name, content) => {
  const file = path.join(tmp, name);
  fs.writeFileSync(file, content);
  return file;
};

// Runs the validate command and returns its exit code and output lines
const run = (...files) => {
  validate(files);
  expect(exit).toHaveBeenCalledOnce();
  const output = stripVTControlCharacters(
    write.mock.calls.map(([chunk]) => chunk).join(""),
  );
  return { code: exit.mock.calls[0][0], lines: output.split("\n") };
};

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-cli-validate-"));
  exit = vi.spyOn(process, "exit").mockImplementation(() => {});
  write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe("validate", () => {
  it("exits 0 when every file is valid", () => {
    const { code, lines } = run(src("data/games/18Test.json"));
    expect(code).toBe(0);
    // The directory is relative to where the command runs, and Windows has
    // its own separators, so only check that it is the games folder
    expect(lines[0]).toMatch(/^valid {2}game {8}18Test\.json .*games$/);
  });

  it("skips the 18Broken test game, which has errors on purpose", () => {
    const { code, lines } = run(src("data/games/18Broken.json"));
    expect(code).toBe(0);
    expect(lines[0]).toMatch(/^skip {3}game {8}18Broken\.json/);
  });

  it("validates a game named 18Broken outside the games folder", () => {
    const file = writeTmp("18Broken.json", JSON.stringify({ info: {} }));
    expect(run(file).code).toBe(1);
  });

  it.each([
    ["schema", "schemas/game.schema.json"],
    ["game", "data/games/18Test.json"],
    ["theme", "data/themes/maps/broggles1817.json"],
    ["config", "defaults.json"],
    ["companies", "data/companies/dev.json"],
    ["publishers", "data/publishers/index.json"],
    ["tiles", "data/tiles/yellow.json"],
  ])("detects %s files", (schema, file) => {
    const { code, lines } = run(src(file));
    expect(code).toBe(0);
    expect(lines[0].split(/ +/).slice(0, 3)).toEqual([
      "valid",
      schema,
      path.basename(file),
    ]);
  });

  it("expands globs", () => {
    // Globs always use forward slashes, even on Windows
    const { code, lines } = run(
      src("data/companies/*.json").split(path.sep).join("/"),
    );
    const companies = fs
      .readdirSync(src("data/companies"))
      .filter((file) => file.endsWith(".json"));

    expect(code).toBe(0);
    expect(lines.filter((line) => line.startsWith("valid"))).toHaveLength(
      companies.length,
    );
  });

  it("exits 1 and prints each error pointer for invalid files", () => {
    const valid = src("data/tiles/yellow.json");
    const invalid = writeTmp("bad.json", '{"info":{"title":5}}');

    const { code, lines } = run(valid, invalid);
    expect(code).toBe(1);
    expect(lines[0]).toMatch(/^valid /);
    expect(lines[1]).toMatch(/^invalid game {8}bad\.json /);
    expect(lines[2]).toBe(
      "#/info/title Expected 5 (number) in #/info/title to be of type string",
    );
    // Blank line after the error list
    expect(lines[3]).toBe("");
  });

  it("indents nested errors under their parent", () => {
    const invalid = writeTmp(
      "tiles.json",
      '{"1":{"color":"yellow","labels":[{"label":"A","fontWeight":true}]}}',
    );

    const { code, lines } = run(invalid);
    expect(code).toBe(1);
    expect(lines[0]).toMatch(/^invalid tiles {7}tiles\.json /);
    expect(lines[1]).toMatch(
      /^#\/1\/labels\/0\/fontWeight .*does not match any given oneof schema$/,
    );
    expect(lines[2]).toBe(
      "....#/1/labels/0/fontWeight Expected given value true in #/1/labels/0/fontWeight to be one of (array)",
    );
    expect(lines[3]).toMatch(/^\.{4}#\/1\/labels\/0\/fontWeight .*string$/);
    expect(lines[4]).toMatch(/^\.{4}#\/1\/labels\/0\/fontWeight .*number$/);
  });

  it("collapses object values in messages", () => {
    const invalid = writeTmp(
      "game.json",
      '{"info":{"title":"x"},"companies":[{"name":"A","abbrev":"A","tokens":{}}]}',
    );

    const { lines } = run(invalid);
    expect(lines).toContain(
      "....#/companies/0/tokens Expected (object) in #/companies/0/tokens to be of type array",
    );
  });

  it.each([
    [{ name: "A", abbrev: "A" }, 0],
    [{ name: "A" }, 1],
    [{ name: "A", abbrev: 3 }, 1],
  ])("checks the abbrev of the company %j", (company, code) => {
    const file = writeTmp(
      "game.json",
      JSON.stringify({ info: { title: "x" }, companies: [company] }),
    );
    expect(run(file).code).toBe(code);
  });

  it("accepts loan slots with labels or empty slots", () => {
    const valid = writeTmp(
      "game.json",
      '{"info":{"title":"x"},"companies":[{"name":"A","abbrev":"A","loans":[50,"x","",null]}]}',
    );
    expect(run(valid).code).toBe(0);
  });

  it.each(["{}", "[{}]"])("rejects loans of %s", (loans) => {
    const invalid = writeTmp(
      "game.json",
      `{"info":{"title":"x"},"companies":[{"name":"A","abbrev":"A","loans":${loans}}]}`,
    );
    expect(run(invalid).code).toBe(1);
  });

  it.each([
    [true, 0],
    [false, 0],
    ['"yes"', 1],
  ])("validates tokensBelow of %s", (value, code) => {
    const file = writeTmp(
      "game.json",
      `{"info":{"title":"x"},"companies":[{"name":"A","abbrev":"A","tokensBelow":${value}}]}`,
    );
    expect(run(file).code).toBe(code);
  });

  it.each([
    ['"SYSTEM"', 0],
    [5, 1],
  ])("validates banner of %s", (value, code) => {
    const file = writeTmp(
      "game.json",
      `{"info":{"title":"x"},"companies":[{"name":"A","abbrev":"A","banner":${value}}]}`,
    );
    expect(run(file).code).toBe(code);
  });

  it.each([
    [
      `"home":["A1","B2"],"destination":"C3","ability":"x","charterSubtitle":{"left":"a","middle":"","right":"c"}`,
      0,
    ],
    [`"home":"A1"`, 0],
    [`"destination":5`, 1],
    [`"charterSubtitle":{"top":"a"}`, 1],
  ])("validates charter subtitle fields %s", (fields, code) => {
    const file = writeTmp(
      "game.json",
      `{"info":{"title":"x"},"companies":[{"name":"A","abbrev":"A",${fields}}]}`,
    );
    expect(run(file).code).toBe(code);
  });

  it("reports files that are not json as errors", () => {
    const broken = writeTmp("broken.json", "{");

    const { code, lines } = run(broken);
    expect(code).toBe(1);
    expect(lines[0]).toMatch(/^error {2}unknown {5}broken\.json /);
    expect(lines.join("\n")).toContain("Expected property name");
  });

  it("validates nothing when a glob matches no files", () => {
    const { code, lines } = run(path.join(tmp, "missing.json"));
    expect(code).toBe(0);
    expect(lines).toEqual([""]);
  });

  describe("the references of a game", () => {
    const withGame = (game) =>
      writeTmp(
        "game.json",
        JSON.stringify({ info: { title: "Game" }, ...game }),
      );

    // x-ref is an annotation: a name the game does not have is still valid
    it.each([
      ["a private company", { privates: [{ name: "P", company: "NOPE" }] }],
      [
        "a train event that is a name",
        {
          trains: [
            { name: "2", color: "white", price: 1, quantity: 1, rust: "NOPE" },
          ],
        },
      ],
      [
        "a train event that is a list",
        {
          trains: [
            {
              name: "2",
              color: "white",
              price: 1,
              quantity: 1,
              rust: ["3", "NOPE"],
            },
          ],
        },
      ],
      [
        "a train event that names the Nth train",
        {
          trains: [
            {
              name: "2",
              color: "white",
              quantity: 1,
              price: 1,
              rust: { on: "NOPE", index: 2 },
            },
          ],
        },
      ],
      [
        "a company of a market cell, in a oneOf",
        { stock: { market: [[{ companies: ["NOPE"] }]] } },
      ],
    ])("accepts %s that names nothing", (_, game) => {
      expect(run(withGame(game)).code).toBe(0);
    });

    it("still rejects a value of the wrong type", () => {
      expect(
        run(withGame({ privates: [{ name: "P", company: 3 }] })).code,
      ).not.toBe(0);
    });
  });

  describe("iconSize of a private", () => {
    const withPrivate = (iconSize) =>
      writeTmp(
        "game.json",
        JSON.stringify({
          info: { title: "Game" },
          privates: [{ name: "P", icon: "share", iconSize }],
        }),
      );

    it("accepts a positive number", () => {
      expect(run(withPrivate(1.5)).code).toBe(0);
    });

    it.each([0, -1, "2"])("rejects %j", (value) => {
      expect(run(withPrivate(value)).code).not.toBe(0);
    });
  });

  describe("the groups of a game", () => {
    const withGroups = (extra) =>
      writeTmp(
        "game.json",
        JSON.stringify({
          info: { title: "Game" },
          groups: [{ id: "a" }],
          ...extra,
        }),
      );

    it("accepts a minimal group", () => {
      expect(run(withGroups({})).code).toBe(0);
    });

    it("accepts a full group", () => {
      expect(
        run(
          withGroups({
            groups: [
              {
                id: "full",
                name: "Full",
                shape: "triangle",
                color: "red",
                borderColor: "black",
                text: "F",
                textColor: "white",
              },
            ],
            companies: [{ name: "A", abbrev: "A", group: "full" }],
            privates: [{ name: "P", group: "full" }],
            shareTypes: { default: [{ quantity: 1, president: true }] },
          }),
        ).code,
      ).toBe(0);
    });

    it.each([
      [{ groups: [{ shape: "circle" }] }, "#/groups/0", /id/],
      [{ groups: [{ id: "a", shape: "star" }] }, "#/groups/0/shape", /one of/i],
      [{ groups: [{ id: "a", size: 3 }] }, "#/groups/0", /size/],
      [
        { shareTypes: { default: [{ quantity: 1, president: "yes" }] } },
        "#/shareTypes/default/0/president",
        /boolean/i,
      ],
      [
        { companies: [{ name: "A", abbrev: "A", group: 5 }] },
        "#/companies/0/group",
        /string/i,
      ],
      [
        { privates: [{ name: "P", group: 5 }] },
        "#/privates/0/group",
        /string/i,
      ],
    ])("rejects %j", (extra, pointer, message) => {
      const { code, lines } = run(withGroups(extra));
      expect(code).toBe(1);
      const line = lines.find((l) => l.startsWith(pointer));
      expect(line).toMatch(message);
    });
  });

  describe("a renamed field of a game", () => {
    const withMeta = (game) => omit(["meta"], game);

    it("validates under its old name", () => {
      const file = writeTmp(
        "old.json",
        JSON.stringify(withMeta(deprecatedGame())),
      );
      expect(run(file).code).toBe(0);
    });

    it("validates under its new name", () => {
      const file = writeTmp(
        "new.json",
        JSON.stringify(withMeta(renamedGame())),
      );
      expect(run(file).code).toBe(0);
    });

    it("validates with both names", () => {
      expect(
        run(writeTmp("both.json", JSON.stringify(withMeta(bothGame())))).code,
      ).toBe(0);
    });
  });

  describe("tile border strokeWidth", () => {
    const withBorder = (border) =>
      writeTmp(
        "game.json",
        JSON.stringify({
          info: { title: "Game" },
          tiles: {
            1: { color: "yellow", borders: [{ color: "blue", ...border }] },
          },
        }),
      );

    it("accepts a positive strokeWidth", () => {
      expect(run(withBorder({ strokeWidth: 4 })).code).toBe(0);
    });

    it("accepts a strokeWidth on a dashed border", () => {
      expect(
        run(withBorder({ dashed: true, strokeWidth: 4, width: 24 })).code,
      ).toBe(0);
    });

    it.each([["4"], [0], [-3]])("rejects strokeWidth %j", (strokeWidth) => {
      expect(run(withBorder({ strokeWidth })).code).not.toBe(0);
    });
  });

  describe("the exports of a game", () => {
    const withExports = (exports) =>
      writeTmp(
        "game.json",
        JSON.stringify({ info: { title: "Game" }, exports }),
      );

    it("accepts every option", () => {
      const { code } = run(
        withExports({
          formats: ["pdf", "png", "svg", "b18"],
          docs: ["map", "tile-manifest"],
          layouts: "current",
          variation: 0,
          png: { dpi: 300 },
          cards: { bleed: 12.5 },
          b18: { version: "2.0", author: "Me" },
        }),
      );
      expect(code).toBe(0);
    });

    it("accepts svg as the only format", () => {
      expect(run(withExports({ formats: ["svg"] })).code).toBe(0);
    });

    it("accepts a game without them, and with none set", () => {
      expect(run(withExports({})).code).toBe(0);
    });

    it("still accepts the deprecated paginated option", () => {
      expect(run(withExports({ paginated: true })).code).toBe(0);
    });

    it.each([
      [
        { png: { dpi: 301 } },
        "#/exports/png/dpi",
        /is 301, but should be 300 at maximum/,
      ],
      [
        { png: { dpi: 0 } },
        "#/exports/png/dpi",
        /is 0, but should be 1 at minimum/,
      ],
      [{ png: { dpi: 1.5 } }, "#/exports/png/dpi", /integer/i],
      [
        { cards: { bleed: 51 } },
        "#/exports/cards/bleed",
        /should be 50 at maximum/,
      ],
      [
        { cards: { bleed: -1 } },
        "#/exports/cards/bleed",
        /should be 0 at minimum/,
      ],
      [{ cards: { color: "red" } }, "#/exports/cards", /color/i],
      [{ formats: ["gif"] }, "#/exports/formats/0", /one of/i],
      [{ formats: [] }, "#/exports/formats", /at least 1/i],
      [{ docs: ["nothing"] }, "#/exports/docs/0", /one of/i],
      [{ layouts: "some" }, "#/exports/layouts", /one of/i],
      [{ variation: -1 }, "#/exports/variation", /should be 0 at minimum/],
      [{ b18: { version: "" } }, "#/exports/b18/version", /length/i],
      [{ b18: { color: "red" } }, "#/exports/b18", /color/i],
      [{ pdf: {} }, "#/exports", /pdf/i],
      [{ paginated: "yes" }, "#/exports/paginated", /boolean/i],
    ])("rejects %j", (exports, pointer, message) => {
      const { code, lines } = run(withExports(exports));
      expect(code).toBe(1);
      const line = lines.find((l) => l.startsWith(pointer));
      expect(line).toMatch(message);
    });
  });

  describe("the config of a game", () => {
    const withConfig = (config) =>
      writeTmp(
        "game.json",
        JSON.stringify({ info: { title: "Game" }, config }),
      );

    it.each([
      { paper: { margins: 0.25 } },
      { cards: { layout: "die" }, theme: "x" },
      {},
    ])("accepts %j", (config) => {
      expect(run(withConfig(config)).code).toBe(0);
    });

    it.each([
      [{ printScale: 110 }, "printScale"],
      [{ allowGameConfig: true }, "allowGameConfig"],
      [{ nothing: 1 }, "nothing"],
    ])("rejects %j", (config, key) => {
      const { code, lines } = run(withConfig(config));
      expect(code).toBe(1);
      expect(lines.some((l) => l.includes(key))).toBe(true);
    });

    const fonts = {
      families: { fancy: "Georgia, serif" },
      roles: {
        body: { family: "fancy", size: 11, weight: 400, style: "oblique" },
        title: { weight: "bold" },
      },
    };

    it("accepts fonts", () => {
      expect(run(withConfig({ fonts })).code).toBe(0);
    });

    it("has the keys of the config schema, but the two of the user", () => {
      const read = (name) =>
        JSON.parse(fs.readFileSync(src(`schemas/${name}.schema.json`), "utf8"));
      const keys = Object.keys(read("config").properties).filter(
        (key) => !["printScale", "allowGameConfig"].includes(key),
      );
      expect(read("game").properties.config.propertyNames.enum).toEqual(keys);
    });
  });

  describe("the fonts of the config", () => {
    const defaults = JSON.parse(fs.readFileSync(src("defaults.json"), "utf8"));
    const withFonts = (fonts) =>
      writeTmp("config.json", JSON.stringify({ ...defaults, fonts }));

    it("accepts roles and families", () => {
      expect(
        run(
          withFonts({
            families: { fancy: "Georgia, serif" },
            roles: { card: { family: "fancy", size: 9.5, weight: "bold" } },
          }),
        ).code,
      ).toBe(0);
    });

    it.each([
      [{ roles: { nothing: {} } }, "nothing"],
      [{ roles: { title: { style: "regular" } } }, "style"],
      [{ roles: { title: { size: "14" } } }, "size"],
      [{ roles: { title: { size: 0 } } }, "size"],
      [{ extra: 1 }, "extra"],
    ])("rejects %j", (fonts, key) => {
      const { code, lines } = run(withFonts(fonts));
      expect(code).toBe(1);
      expect(lines.some((l) => l.includes(key))).toBe(true);
    });
  });

  describe("the allow game config setting", () => {
    const defaults = JSON.parse(fs.readFileSync(src("defaults.json"), "utf8"));
    const withAllow = (allowGameConfig) =>
      writeTmp("config.json", JSON.stringify({ ...defaults, allowGameConfig }));

    it.each([true, false])("accepts %j", (value) => {
      expect(run(withAllow(value)).code).toBe(0);
    });

    it.each(["true", 1])("rejects %j", (value) => {
      const { code, lines } = run(withAllow(value));
      expect(code).toBe(1);
      expect(lines.some((l) => l.startsWith("#/allowGameConfig"))).toBe(true);
    });
  });

  describe("half hexes and a trimmed map", () => {
    const withMap = (map) =>
      writeTmp("game.json", JSON.stringify({ info: { title: "Game" }, map }));

    it.each(["top", "bottom", "left", "right"])(
      "accepts the %s half",
      (half) => {
        expect(
          run(withMap({ hexes: [{ color: "plain", half, hexes: ["A1"] }] }))
            .code,
        ).toBe(0);
      },
    );

    it("accepts a trim of any edges", () => {
      expect(
        run(withMap({ trim: { top: true, left: false }, hexes: [] })).code,
      ).toBe(0);
    });

    it("rejects an unknown half", () => {
      const { code, lines } = run(
        withMap({ hexes: [{ half: "middle", hexes: ["A1"] }] }),
      );
      expect(code).toBe(1);
      expect(lines.find((l) => l.includes("half"))).toMatch(/one of/i);
    });

    it.each([
      [true, /object/i],
      [{ middle: true }, /middle/i],
      [{ top: "yes" }, /boolean/i],
    ])("rejects the trim %j", (trim, message) => {
      const { code, lines } = run(withMap({ trim, hexes: [] }));
      expect(code).toBe(1);
      expect(lines.find((l) => l.includes("#/map/trim"))).toMatch(message);
    });
  });

  describe("the draw order of a tile element", () => {
    const withHex = (hex) =>
      writeTmp(
        "game.json",
        JSON.stringify({
          info: { title: "Game" },
          tiles: { X1: { color: "yellow", ...hex } },
        }),
      );

    it.each([
      ["a number", { values: [{ value: 20, order: 1 }] }],
      ["a negative number", { cities: [{ order: -1 }] }],
      ["zero", { labels: [{ label: "A", order: 0 }] }],
      ["true", { towns: [{ order: true }] }],
      ["a token", { tokens: [{ order: 2 }] }],
    ])("accepts %s", (_, hex) => {
      expect(run(withHex(hex)).code).toBe(0);
    });

    it.each([
      [{ values: [{ value: 20, order: false }] }],
      [{ values: [{ value: 20, order: "1" }] }],
      [{ track: [{ type: "straight", side: 1, order: 1 }] }],
      [{ divides: [{ side: 1, order: 1 }] }],
      [{ borders: [{ side: 1, order: 1 }] }],
    ])("rejects %j", (hex) => {
      expect(run(withHex(hex)).code).toBe(1);
    });
  });

  describe("the named position of a tile element", () => {
    const withHex = (hex) =>
      writeTmp(
        "game.json",
        JSON.stringify({
          info: { title: "Game" },
          tiles: { X1: { color: "yellow", ...hex } },
        }),
      );

    it.each([
      ["sharp", { centerTowns: [{ mid: "sharp" }] }],
      ["gentle with align", { towns: [{ mid: "gentle", align: "parallel" }] }],
      [
        "a side",
        { towns: [{ mid: "straight", side: 3, align: "perpendicular" }] },
      ],
      ["a value", { values: [{ value: 10, mid: "gentle", y: 5 }] }],
    ])("accepts %s", (_, hex) => {
      expect(run(withHex(hex)).code).toBe(0);
    });

    it.each([
      [{ towns: [{ mid: "wide" }] }],
      [{ towns: [{ mid: "sharp", align: "across" }] }],
      [{ towns: [{ mid: 1 }] }],
      [{ towns: [{ align: "parallel" }] }],
    ])("rejects %j", (hex) => {
      expect(run(withHex(hex)).code).toBe(1);
    });
  });

  describe("the card sizes of a config", () => {
    const defaults = JSON.parse(fs.readFileSync(src("defaults.json"), "utf8"));
    const withSizes = (sizes) =>
      writeTmp(
        "config.json",
        JSON.stringify({ ...defaults, cards: { ...defaults.cards, sizes } }),
      );

    it.each([
      ["none", {}],
      ["a width", { private: { width: 200 } }],
      ["a height", { train: { height: 150 } }],
      ["every type", { private: {}, share: {}, train: {}, number: {} }],
      ["both", { number: { width: 100, height: 120.5 } }],
    ])("accepts %s", (_, sizes) => {
      expect(run(withSizes(sizes)).code).toBe(0);
    });

    it.each([
      [{ private: { width: 0 } }, "#/cards/sizes/private/width"],
      [{ share: { height: "big" } }, "#/cards/sizes/share/height"],
      [{ train: { depth: 3 } }, "#/cards/sizes/train"],
      [{ token: { width: 3 } }, "#/cards/sizes"],
    ])("rejects %j", (sizes, pointer) => {
      const { code, lines } = run(withSizes(sizes));
      expect(code).toBe(1);
      expect(lines.some((l) => l.startsWith(pointer))).toBe(true);
    });
  });

  describe("the print scale of a config", () => {
    const defaults = JSON.parse(fs.readFileSync(src("defaults.json"), "utf8"));
    const withScale = (printScale) =>
      writeTmp("config.json", JSON.stringify({ ...defaults, printScale }));

    it.each([50, 95, 100, 110.5, 200])("accepts %s", (value) => {
      expect(run(withScale(value)).code).toBe(0);
    });

    it.each([49, 201, 0, "110", true])("rejects %j", (value) => {
      const { code, lines } = run(withScale(value));
      expect(code).toBe(1);
      expect(lines.some((l) => l.startsWith("#/printScale"))).toBe(true);
    });
  });

  describe("the duplex of a config", () => {
    const defaults = JSON.parse(fs.readFileSync(src("defaults.json"), "utf8"));
    const withDuplex = (duplex) =>
      writeTmp(
        "config.json",
        JSON.stringify({ ...defaults, cards: { ...defaults.cards, duplex } }),
      );

    it.each(["off", "separate", "long"])("accepts %s", (value) => {
      expect(run(withDuplex(value)).code).toBe(0);
    });

    it.each(["short", true, 1])("rejects %j", (value) => {
      const { code, lines } = run(withDuplex(value));
      expect(code).toBe(1);
      expect(lines.some((l) => l.startsWith("#/cards/duplex"))).toBe(true);
    });
  });

  describe("the back of a train", () => {
    const withBack = (back) =>
      writeTmp(
        "game.json",
        JSON.stringify({
          info: { title: "Game" },
          trains: [
            { name: "2", color: "white", price: 100, quantity: 2, back },
          ],
        }),
      );

    it.each([
      ["empty", {}],
      ["a title", { title: "Two" }],
      [
        "everything",
        { title: "2", text: "Rusts", color: "white", backgroundColor: "red" },
      ],
      ["a full train", { name: "3", color: "green", price: 200 }],
    ])("accepts %s", (_, back) => {
      expect(run(withBack(back)).code).toBe(0);
    });

    it.each([
      ["a string", "Two"],
      ["an unknown field", { title: "2", image: "2T" }],
      ["a number title", { title: 2 }],
      ["a train without a color", { name: "3", price: 200 }],
      ["a train mixed with a title", { name: "3", color: "green", title: "3" }],
    ])("rejects %s", (_, back) => {
      expect(run(withBack(back)).code).toBe(1);
    });
  });

  describe("the die sizes of a config", () => {
    const defaults = JSON.parse(fs.readFileSync(src("defaults.json"), "utf8"));
    const withDice = (dice) =>
      writeTmp(
        "config.json",
        JSON.stringify({ ...defaults, cards: { ...defaults.cards, dice } }),
      );

    it.each([
      ["none", {}],
      ["a width", { dtgDie: { width: 260 } }],
      ["both dice", { miniEuroDie: { height: 170.5 }, dtgDie: { width: 1 } }],
      [
        "sizes per type",
        { miniEuroDie: { sizes: { share: { width: 100 }, number: {} } } },
      ],
    ])("accepts %s", (_, dice) => {
      expect(run(withDice(dice)).code).toBe(0);
    });

    it.each([
      [{ dtgDie: { width: 0 } }, "#/cards/dice/dtgDie/width"],
      [{ dtgDie: { height: "tall" } }, "#/cards/dice/dtgDie/height"],
      [{ dtgDie: { cutlines: 5 } }, "#/cards/dice/dtgDie"],
      [{ dtgDie: { paper: { width: 5 } } }, "#/cards/dice/dtgDie"],
      [{ miniEuroDie: { sizes: { token: {} } } }, "#/cards/dice/miniEuroDie"],
      [{ bigDie: { width: 5 } }, "#/cards/dice"],
    ])("rejects %j", (dice, pointer) => {
      const { code, lines } = run(withDice(dice));
      expect(code).toBe(1);
      expect(lines.some((l) => l.startsWith(pointer))).toBe(true);
    });
  });

  describe("the tile cut border of a config", () => {
    const defaults = JSON.parse(fs.readFileSync(src("defaults.json"), "utf8"));
    const withCutBorder = (cutBorder) =>
      writeTmp(
        "config.json",
        JSON.stringify({
          ...defaults,
          tiles: { ...defaults.tiles, cutBorder },
        }),
      );

    it.each([true, false])("accepts %s", (value) => {
      expect(run(withCutBorder(value)).code).toBe(0);
    });

    it("rejects a value that is not a boolean", () => {
      const { code, lines } = run(withCutBorder("yes"));
      expect(code).toBe(1);
      expect(lines.some((l) => l.startsWith("#/tiles/cutBorder"))).toBe(true);
    });
  });

  describe("the starting tokens of a company", () => {
    const withTokens = (tokens) =>
      writeTmp(
        "game.json",
        JSON.stringify({
          info: { title: "Game" },
          companies: [{ name: "A", abbrev: "A", tokens }],
        }),
      );

    it.each([
      ["a cost and start", [{ cost: 40, start: true }, 40, "Home"]],
      ["start without a cost", [{ start: true }]],
      ["a string cost", [{ cost: "Free", start: false }]],
    ])("accepts %s", (_, tokens) => {
      expect(run(withTokens(tokens)).code).toBe(0);
    });

    it.each([
      [[{ cost: 40, start: "yes" }], "start"],
      [[{ cost: 40, begin: true }], "begin"],
      [[{ cost: [40] }], "cost"],
    ])("rejects %j", (tokens, message) => {
      const { code, lines } = run(withTokens(tokens));
      expect(code).toBe(1);
      expect(lines.join("\n")).toContain(message);
    });
  });

  describe("the second token line of a company", () => {
    const withToken = (token) =>
      writeTmp(
        "game.json",
        JSON.stringify({
          info: { title: "Game" },
          companies: [{ name: "A", abbrev: "A", token }],
        }),
      );

    it("accepts label2 settings", () => {
      const token = {
        label2: "Two",
        label2Position: "above",
        label2Color: "red",
      };
      expect(run(withToken(token)).code).toBe(0);
    });

    it("rejects a bad label2Position", () => {
      const { code, lines } = run(withToken({ label2Position: "left" }));
      expect(code).toBe(1);
      expect(lines.join("\n")).toContain("label2Position");
    });
  });

  describe("the trains of a game and its companies", () => {
    const withTrains = (trains, companyTrains) =>
      writeTmp(
        "game.json",
        JSON.stringify({
          info: { title: "Game" },
          trains,
          companies: [{ name: "A", abbrev: "A", trains: companyTrains }],
        }),
      );
    const gameTrains = [{ name: "2", color: "white", price: 100, quantity: 2 }];

    it.each([
      ["a name", ["2"]],
      ["a reference", [{ name: "2", quantity: 2 }]],
      ["a full train", [{ name: "S", color: "yellow", price: 50 }]],
      [
        "a full train with a quantity",
        [{ name: "S", color: "red", quantity: 2 }],
      ],
      ["false", false],
    ])("accepts company trains as %s", (_, companyTrains) => {
      expect(run(withTrains(gameTrains, companyTrains)).code).toBe(0);
    });

    it("accepts upgrade and tradeIn on a train", () => {
      const trains = [
        {
          name: "D",
          color: "brown",
          quantity: 1,
          upgrade: 800,
          tradeIn: "$300",
        },
      ];
      expect(run(withTrains(trains, false)).code).toBe(0);
    });

    it("rejects a negative upgrade", () => {
      const trains = [{ name: "D", color: "brown", quantity: 1, upgrade: -1 }];
      expect(run(withTrains(trains, false)).code).toBe(1);
    });

    it.each([
      ["true", gameTrains, true],
      ["an infinite quantity", gameTrains, [{ name: "2", quantity: "∞" }]],
      ["a full train without a color", gameTrains, [{ name: "S", price: 50 }]],
      [
        "a game train without a quantity",
        [{ name: "2", color: "white", price: 100 }],
        ["2"],
      ],
    ])("rejects %s", (_, trains, companyTrains) => {
      expect(run(withTrains(trains, companyTrains)).code).toBe(1);
    });
  });

  describe("the format strings of trains and privates", () => {
    const withGame = (game) =>
      writeTmp(
        "game.json",
        JSON.stringify({ info: { title: "Game" }, ...game }),
      );
    const train = (extra) => ({
      trains: [
        { name: "2", color: "white", price: 100, quantity: 2, ...extra },
      ],
    });
    const priv = (extra) => ({
      privates: [{ name: "P", price: 20, revenue: 5, ...extra }],
    });

    it.each([
      ["priceFormat", "#G"],
      ["upgradeFormat", "+#"],
      ["tradeInFormat", "-# trade"],
    ])("accepts %s on a train", (field, value) => {
      expect(run(withGame(train({ [field]: value }))).code).toBe(0);
    });

    it.each([
      ["priceFormat", "#G"],
      ["revenueFormat", "+#"],
    ])("accepts %s on a private", (field, value) => {
      expect(run(withGame(priv({ [field]: value }))).code).toBe(0);
    });

    it("accepts a format on a full company train", () => {
      const game = {
        ...train({}),
        companies: [
          {
            name: "A",
            abbrev: "A",
            trains: [{ name: "S", color: "red", price: 50, priceFormat: "#G" }],
          },
        ],
      };
      expect(run(withGame(game)).code).toBe(0);
    });

    it.each([
      ["a train price", train({ priceFormat: "G" })],
      ["a train upgrade", train({ upgradeFormat: "G" })],
      ["a train trade in", train({ tradeInFormat: "G" })],
      ["a private price", priv({ priceFormat: "G" })],
      ["a private revenue", priv({ revenueFormat: "G" })],
    ])("rejects a format without # on %s", (_, game) => {
      expect(run(withGame(game)).code).toBe(1);
    });

    it.each([
      ["a train price", train({ priceFormat: 1 })],
      ["a private revenue", priv({ revenueFormat: ["#"] })],
    ])("rejects a format that is not a string on %s", (_, game) => {
      expect(run(withGame(game)).code).toBe(1);
    });

    it.each([
      ["a train", train({ costFormat: "#G" })],
      ["a private", priv({ bidFormat: "#G" })],
    ])("still rejects an unknown key on %s", (_, game) => {
      expect(run(withGame(game)).code).toBe(1);
    });
  });

  describe("the sections of a game", () => {
    const withGame = (game) =>
      writeTmp(
        "game.json",
        JSON.stringify({ info: { title: "Game" }, ...game }),
      );

    it("accepts a token on a company of a company file", () => {
      const file = writeTmp(
        "companies.json",
        JSON.stringify({
          name: "Set",
          abbrev: "S",
          companies: [
            {
              name: "A",
              abbrev: "A",
              color: "red",
              token: { stripe: "white" },
            },
          ],
        }),
      );
      expect(run(file).code).toBe(0);
    });

    it("accepts an alias on a company of a game", () => {
      expect(
        run(
          withGame({
            companies: [{ name: "A", abbrev: "A", color: "red", alias: "B" }],
          }),
        ).code,
      ).toBe(0);
    });

    it("accepts an alias on a company of a company file", () => {
      const file = writeTmp(
        "companies.json",
        JSON.stringify({
          name: "Set",
          abbrev: "S",
          companies: [{ name: "A", abbrev: "A", color: "red", alias: "B" }],
        }),
      );
      expect(run(file).code).toBe(0);
    });

    it("rejects an alias that is not a string", () => {
      const file = writeTmp(
        "companies.json",
        JSON.stringify({
          name: "Set",
          abbrev: "S",
          companies: [{ name: "A", abbrev: "A", color: "red", alias: 1 }],
        }),
      );
      expect(run(file).code).toBe(1);
    });

    it("rejects an unknown token property on a company of a company file", () => {
      const file = writeTmp(
        "companies.json",
        JSON.stringify({
          name: "Set",
          abbrev: "S",
          companies: [
            { name: "A", abbrev: "A", color: "red", token: { bogus: 1 } },
          ],
        }),
      );
      expect(run(file).code).toBe(1);
    });

    it("validates every shipped game, company file and tile file", () => {
      const globs = ["games", "companies", "tiles", "publishers"].map((dir) =>
        src(`data/${dir}/*.json`).split(path.sep).join("/"),
      );
      expect(run(...globs).code).toBe(0);
    });

    it.each([
      [
        "rounds",
        {
          rounds: [
            { name: "SR", color: "white" },
            { name: "OR", color: "gray", small: true },
          ],
        },
      ],
      [
        "a round with a token shape",
        { rounds: [{ name: "OR", color: "gray", halves: ["red", "blue"] }] },
      ],
      [
        "turns",
        {
          turns: [
            { name: "Turn", steps: ["Lay"], ordered: true, optional: ["Sell"] },
          ],
        },
      ],
      [
        "a 2D market",
        {
          stock: {
            type: "2D",
            market: [
              [10, "20", { value: 30, arrow: ["up", "down"], legend: 0 }, null],
              [{ label: "A", par: true }],
            ],
            legend: [{ description: "Info", color: "red" }],
          },
        },
      ],
      [
        "a market with a movement legend",
        {
          stock: {
            type: "2D",
            market: [[10]],
            movement: { up: ["Sold out"], "2x right": ["Paid"] },
            display: { movement: { x: 1, y: 2 } },
          },
          map: { hexes: [], movement: { x: 10, y: 20 } },
        },
      ],
      [
        "a 1D market with ledges",
        {
          stock: {
            type: "1D",
            market: [{ value: 10, height: 2 }],
            ledges: [
              {
                coords: ["4 0", "4 1"],
                color: "red",
                dashed: true,
                offset: -7,
              },
            ],
          },
        },
      ],
      [
        "par and display",
        {
          stock: {
            par: { values: [[40], 50], color: "orange" },
            display: {
              par: { x: 1, y: 2 },
              legend: { x: 1, y: 2, align: "right" },
              roundTracker: { x: 1, y: 1, type: "round" },
            },
            title: false,
          },
        },
      ],
      [
        "stock movement",
        {
          stock: {
            movement: { up: ["Sold out"], "2x right": ["Paid"] },
            limits: [{ min: 1, max: 2, color: "red", description: "Par" }],
          },
        },
      ],
      ["a revenue range", { revenue: { min: 10, max: 200, perRow: 10 } }],
      [
        "tokens",
        {
          tokens: [
            "Round",
            5,
            { label: "+30", color: "white", quantity: 2 },
            { logo: "SJ", quantity: "∞", print: 13 },
          ],
        },
      ],
      [
        "named and phased colors",
        {
          colors: {
            red: "#f00",
            _blue: "blue",
            ground: { default: "tan", "phase2+": "yellow" },
          },
        },
      ],
      [
        "company tokens",
        {
          companies: [
            {
              name: "A",
              abbrev: "A",
              token: {
                color: "red",
                stripe: "white",
                halves: ["red", "blue"],
                bar: true,
                shield: true,
              },
            },
          ],
        },
      ],
      [
        "a private with a token",
        {
          privates: [
            {
              name: "P",
              token: { logo: "SJ", iconColor: "red" },
            },
          ],
        },
      ],
    ])("accepts %s", (_, game) => {
      const { code, lines } = run(withGame(game));
      expect(lines.filter((line) => line.startsWith("#"))).toEqual([]);
      expect(code).toBe(0);
    });

    it.each([
      ["a round without a name", { rounds: [{ color: "white" }] }, "name"],
      [
        "an unknown round property",
        { rounds: [{ name: "SR", colour: "white" }] },
        "colour",
      ],
      ["a turn without a name", { turns: [{ steps: [] }] }, "name"],
      [
        "an unknown turn property",
        { turns: [{ name: "T", step: [] }] },
        "step",
      ],
      [
        "a market movement without y",
        { stock: { display: { movement: { x: 1 } } } },
        "y",
      ],
      [
        "a map movement with an unknown property",
        { map: { hexes: [], movement: { x: 1, y: 1, z: 1 } } },
        "z",
      ],
      [
        "a movement that is not a list",
        { stock: { movement: { up: "Sold out" } } },
        "up",
      ],
      ["a bad market type", { stock: { type: "3D" } }, "type"],
      ["an unknown stock property", { stock: { markets: [] } }, "markets"],
      ["a bad arrow", { stock: { market: [{ arrow: "sideways" }] } }, "arrow"],
      [
        "a bad ledge corner",
        { stock: { ledges: [{ coords: ["a", "b"] }] } },
        "coords",
      ],
      [
        "a ledge without coords",
        { stock: { ledges: [{ color: "red" }] } },
        "coords",
      ],
      [
        "a legend without a description",
        { stock: { legend: [{ color: "red" }] } },
        "description",
      ],
      ["a revenue range of zero", { revenue: { perRow: 0 } }, "perRow"],
      [
        "an unknown token property",
        { tokens: [{ label: "A", colour: "red" }] },
        "colour",
      ],
      [
        "a token with an array color",
        { tokens: [{ label: "A", color: ["red"] }] },
        "color",
      ],
      [
        "halves of three colors",
        { tokens: [{ halves: ["a", "b", "c"] }] },
        "halves",
      ],
      [
        "a company token with an unknown property",
        { companies: [{ name: "A", abbrev: "A", token: { bogus: 1 } }] },
        "bogus",
      ],
      [
        "a private token with an unknown property",
        { privates: [{ name: "P", token: { bogus: 1 } }] },
        "bogus",
      ],
      [
        "a train event without an index",
        {
          trains: [
            { name: "5", color: "gray", quantity: 1, rust: { on: "6" } },
          ],
        },
        "index",
      ],
      [
        "an unknown train event property",
        {
          trains: [
            {
              name: "5",
              color: "gray",
              quantity: 1,
              rust: { on: "6", index: 2, at: 1 },
            },
          ],
        },
        "at",
      ],
      [
        "a phase event that is not a boolean",
        {
          phases: [
            { name: "5", limit: 3, tiles: "brown", events: { explode: "yes" } },
          ],
        },
        "explode",
      ],
      [
        "an unknown player property",
        { players: [{ number: 3, cnkapital: 400 }] },
        "cnkapital",
      ],
      [
        "a bad map coordinate",
        { map: { hexes: [], lines: [{ coords: ["A1", "B2p1"] }] } },
        "coords",
      ],
      [
        "a map line without coords",
        { map: { hexes: [], lines: [{ color: "red" }] } },
        "coords",
      ],
      [
        "an unknown map border property",
        {
          map: {
            hexes: [],
            borders: [{ coords: ["A1p1", "A2p1"], colour: "red" }],
          },
        },
        "colour",
      ],
      [
        "a border text without a coordinate",
        { map: { hexes: [], borderTexts: [{ cost: 10 }] } },
        "coord",
      ],
      [
        "a bad map coordinates setting",
        { info: { title: "G", mapCoordinates: "diagonal" } },
        "mapCoordinates",
      ],
      [
        "a bad tracks gauge",
        { info: { title: "G", trackWidth: "wide" } },
        "trackWidth",
      ],
      ["a color that is a number", { colors: { red: 5 } }, "red"],
      ["a color that is an array", { colors: { red: ["red"] } }, "red"],
    ])("rejects %s", (_, game, message) => {
      const { code, lines } = run(withGame(game));
      expect(code).toBe(1);
      expect(lines.join("\n")).toContain(message);
    });
  });
});

// A removed field is ignored: the game is valid and the field is a warning
describe("the removed fields of a game", () => {
  const withGame = (game) =>
    writeTmp("game.json", JSON.stringify({ info: { title: "Game" }, ...game }));

  it("keeps a game valid and warns for each removed field", () => {
    const { code, lines } = run(
      withGame({
        pools: [{ name: "Bank" }],
        floatPercent: 50,
        trains: [{ name: "5", color: "gray", quantity: 1, discount: { 4: 1 } }],
        tiles: {
          D5: { broken: true, tokens: [{ label: "A", bgFill: "red" }] },
        },
      }),
    );
    expect(code).toBe(0);
    expect(lines.filter((line) => line.startsWith("valid"))).toHaveLength(1);
    expect(lines.filter((line) => line.startsWith("warning"))).toEqual([
      "warning #/pools is a removed field, it is ignored",
      "warning #/floatPercent is a removed field, it is ignored",
      "warning #/trains/0/discount is a removed field, it is ignored",
      "warning #/tiles/D5/broken is a removed field, it is ignored",
      "warning #/tiles/D5/tokens/0/bgFill is a removed field, it is ignored",
    ]);
  });

  it("still fails for a real mistake next to a removed field", () => {
    const { code, lines } = run(withGame({ pools: [], stock: { marekt: 10 } }));
    expect(code).toBe(1);
    expect(lines.join("\n")).toContain("marekt");
  });

  it("fails for a real error in a token next to a removed field", () => {
    const { code, lines } = run(
      withGame({
        trains: [{ name: "5", color: "gray", quantity: 1, discount: { 4: 1 } }],
        tiles: {
          1: { color: "yellow", tokens: [{ company: "A", label: "x" }] },
        },
      }),
    );
    expect(code).toBe(1);
    expect(lines.join("\n")).toContain("label");
  });

  it("does not list a removed field as an error too", () => {
    const { code, lines } = run(withGame({ pools: [], stock: { marekt: 10 } }));
    expect(code).toBe(1);
    expect(lines.filter((l) => l.includes("#/pools"))).toEqual([
      "warning #/pools is a removed field, it is ignored",
    ]);
  });

  it("warns for the removed fields of a file of tiles", () => {
    const file = writeTmp(
      "tiles.json",
      JSON.stringify({
        1: { color: "yellow", broken: true, tokens: [{ label: "A" }] },
      }),
    );
    const { code, lines } = run(file);
    expect(code).toBe(0);
    expect(lines.filter((l) => l.startsWith("warning"))).toEqual([
      "warning #/1/broken is a removed field, it is ignored",
    ]);
  });

  it("does not hit a field of the same name elsewhere", () => {
    expect(run(withGame({ players: [{ number: 3, pools: 1 }] })).code).toBe(1);
  });
});

// The schemas of the source hold keys for text, the published copies the text
// of a language: a game is valid against both
describe("the localized schemas", () => {
  const read = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
  const game = read(src("data/games/18Test.json"));
  const bad = { ...game, players: "three" };

  const check = (folder, data) => {
    const schema = compileSchema(read(path.join(folder, "game.schema.json")), {
      drafts: [draft07],
      remotes: [read(path.join(folder, "tiles.defs.json"))],
    });
    return schema.validate(data).errors;
  };

  it.each([
    ["the source", src("schemas")],
    ["en", path.join(root, "public/schemas")],
    ["de", path.join(root, "public/schemas/de")],
    ["zh", path.join(root, "public/schemas/zh")],
  ])("validates a game with the schema of %s", (_, folder) => {
    expect(check(folder, game)).toEqual([]);
    expect(check(folder, bad)).not.toEqual([]);
  });
});
