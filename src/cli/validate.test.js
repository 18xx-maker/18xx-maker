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
});
