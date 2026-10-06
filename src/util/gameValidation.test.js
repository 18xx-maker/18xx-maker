import { games } from "@/data";
import {
  closest,
  deprecatedIssues,
  deprecatedPaths,
  readablePointer,
  shorten,
  validateGame,
} from "@/util/gameValidation";

import { brokenGame, validGame } from "@tests/support/brokenGame.js";

describe("gameValidation", () => {
  it.each(Object.keys(games).filter((id) => id !== "18Broken"))(
    "finds no problems in %s",
    async (id) => {
      expect(await validateGame(games[id])).toEqual([]);
    },
  );

  it("finds problems in the 18Broken test game", async () => {
    const issues = await validateGame(games["18Broken"]);
    expect(issues.length).toBeGreaterThan(3);
  });

  it("ignores the meta data the app adds", async () => {
    expect(await validateGame(validGame())).toEqual([]);
  });

  it("reports every kind of mistake, errors before deprecations", async () => {
    const issues = await validateGame(brokenGame());

    expect(issues).toEqual([
      {
        severity: "error",
        code: "unknown-field-suggest",
        pointer: "stock.marekt",
        params: { field: "marekt", suggestion: "market" },
      },
      {
        severity: "error",
        code: "type",
        pointer: "exports.png.dpi",
        params: { expected: "integer", found: "string", value: '"300"' },
      },
      {
        severity: "error",
        code: "enum",
        pointer: "exports.layouts",
        params: { value: '"some"', values: "all, current" },
      },
      {
        severity: "error",
        code: "required",
        pointer: "companies[0]",
        params: { field: "abbrev" },
      },
      {
        severity: "warning",
        code: "deprecated",
        pointer: "exports.paginated",
        params: { key: "exports_paginated" },
      },
    ]);
  });

  it("says unknown when no field is close", async () => {
    const [issue] = await validateGame({
      info: { title: "x" },
      zzzzzzzz: 1,
    });
    expect(issue).toMatchObject({
      code: "unknown-field",
      pointer: "zzzzzzzz",
      params: { field: "zzzzzzzz" },
    });
  });

  it("shows the mistake inside a oneOf, not that it is the wrong type", async () => {
    const issues = await validateGame({
      info: { title: "x" },
      map: { hexes: [{ color: "red" }], bogus: 1 },
    });
    expect(issues.map((i) => i.pointer)).toContain("map.bogus");
    expect(issues.every((i) => i.code !== "generic")).toBe(true);
  });

  it("falls back to the library message", async () => {
    const issues = await validateGame({
      info: { title: "x" },
      exports: { png: { dpi: 0 } },
    });
    expect(issues.length).toBeGreaterThan(0);
    for (const issue of issues) expect(issue.severity).toBe("error");
  });

  describe("deprecatedPaths", () => {
    it("finds nested deprecated properties", () => {
      expect(
        deprecatedPaths({
          properties: {
            a: { deprecated: true },
            b: { properties: { c: { deprecated: true }, d: {} } },
          },
        }),
      ).toEqual([["a"], ["b", "c"]]);
    });

    const root = {
      definitions: {
        train: {
          properties: { name: {}, players: { deprecated: true } },
        },
        loop: {
          properties: {
            self: { $ref: "#/definitions/loop" },
            old: { deprecated: true },
          },
        },
      },
      properties: {
        trains: {
          type: "array",
          items: {
            allOf: [{ $ref: "#/definitions/train" }, { required: ["name"] }],
          },
        },
        companies: {
          type: "array",
          items: {
            properties: {
              trains: {
                type: "array",
                items: { $ref: "#/definitions/train" },
              },
            },
          },
        },
        loop: { $ref: "#/definitions/loop" },
        external: { $ref: "tiles.defs.json#/definitions/hex" },
      },
    };

    it("follows items, allOf and $ref, ends on a $ref that contains itself", () => {
      expect(deprecatedPaths(root)).toEqual([
        ["trains", "*", "players"],
        ["companies", "*", "trains", "*", "players"],
        ["loop", "old"],
      ]);
    });

    it("warns for each item that has a deprecated field", () => {
      const data = {
        trains: [{ name: "a" }, { name: "b", players: 3 }, { players: 4 }],
        companies: [{ trains: [{ players: 2 }] }, {}],
        loop: { old: 1 },
      };
      expect(
        deprecatedIssues(deprecatedPaths(root), data).map(
          ({ pointer, params, severity }) => [pointer, params.key, severity],
        ),
      ).toEqual([
        ["trains[1].players", "trains_players", "warning"],
        ["trains[2].players", "trains_players", "warning"],
        [
          "companies[0].trains[0].players",
          "companies_trains_players",
          "warning",
        ],
        ["loop.old", "loop_old", "warning"],
      ]);
      expect(deprecatedIssues(deprecatedPaths(root), { trains: "x" })).toEqual(
        [],
      );
    });

    it("has no deprecated property without a message", async () => {
      const schema = (await import("@/schemas/game.schema.json")).default;
      expect(deprecatedPaths(schema)).toEqual([["exports", "paginated"]]);
    });
  });

  describe("readablePointer", () => {
    it.each([
      ["#/map/hexes/3/color", "map.hexes[3].color"],
      ["#/a~1b/c~0d", "a/b.c~d"],
      ["#", ""],
      [undefined, ""],
      ["#/0", "[0]"],
    ])("reads %s", (pointer, expected) => {
      expect(readablePointer(pointer)).toBe(expected);
    });
  });

  describe("shorten", () => {
    it("quotes strings and cuts long values", () => {
      expect(shorten("a")).toBe('"a"');
      expect(shorten(1)).toBe("1");
      expect(shorten(undefined)).toBe("");
      expect(shorten("x".repeat(100))).toHaveLength(40);
    });
  });

  describe("closest", () => {
    it("ignores case and punctuation", () => {
      expect(closest("cell_height", ["cellHeight", "type"])).toBe("cellHeight");
    });
    it("allows a small typo", () => {
      expect(closest("tokenz", ["tokens", "tiles"])).toBe("tokens");
    });
    it("gives none for a far or tied match", () => {
      expect(closest("zzzz", ["tokens"])).toBeUndefined();
      expect(closest("ab", ["ac", "ad"])).toBeUndefined();
      expect(closest("x", [])).toBeUndefined();
      expect(closest("x", undefined)).toBeUndefined();
    });
  });
});
