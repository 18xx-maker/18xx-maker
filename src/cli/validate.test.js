import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";

import validate from "#cli/validate";

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

  describe("the exports of a game", () => {
    const withExports = (exports) =>
      writeTmp(
        "game.json",
        JSON.stringify({ info: { title: "Game" }, exports }),
      );

    it("accepts every option", () => {
      const { code } = run(
        withExports({
          formats: ["pdf", "png", "b18"],
          docs: ["map", "tile-manifest"],
          layouts: "current",
          variation: 0,
          png: { dpi: 300 },
          b18: { version: "2.0", author: "Me" },
        }),
      );
      expect(code).toBe(0);
    });

    it("accepts a game without them, and with none set", () => {
      expect(run(withExports({})).code).toBe(0);
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
        "pools",
        { pools: [{ name: "Bank", notes: [{ note: "Pays", icon: "x" }] }] },
      ],
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
        "a private with a token and abilities",
        {
          privates: [
            {
              name: "P",
              token: { logo: "SJ", iconColor: "red" },
              abilities: [{ type: "tile_lay", hexes: ["A1"] }],
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
        "an ability without a type",
        { privates: [{ name: "P", abilities: [{ when: "x" }] }] },
        "type",
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
        "a train discount that is not a number",
        {
          trains: [
            { name: "5", color: "gray", quantity: 1, discount: { 4: "a lot" } },
          ],
        },
        "discount",
      ],
      [
        "a negative train discount",
        {
          trains: [
            { name: "5", color: "gray", quantity: 1, discount: { 4: -1 } },
          ],
        },
        "discount",
      ],
      [
        "an unknown phase event",
        {
          phases: [
            { name: "5", limit: 3, tiles: "brown", events: { explode: true } },
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
      [
        "a pool note without a note",
        { pools: [{ name: "B", notes: [{ color: "red" }] }] },
        "note",
      ],
    ])("rejects %s", (_, game, message) => {
      const { code, lines } = run(withGame(game));
      expect(code).toBe(1);
      expect(lines.join("\n")).toContain(message);
    });
  });
});
