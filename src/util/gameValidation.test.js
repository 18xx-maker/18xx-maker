import { games } from "@/data";
import { bundledAssets } from "@/data/gameAssets";
import {
  REMOVED,
  assetIssues,
  closest,
  customReferences,
  deprecatedIssues,
  deprecatedPaths,
  leaves,
  readablePointer,
  removedPointers,
  shorten,
  trainReferenceIssues,
  validateGame,
} from "@/util/gameValidation";

import { brokenGame, validGame } from "@tests/support/brokenGame.js";
import {
  deprecatedGame,
  renamedGame,
  renames,
} from "@tests/support/deprecatedGame.js";

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

  it("lists the removed fields of 18Broken as deprecated warnings", async () => {
    const issues = await validateGame(games["18Broken"]);
    const removed = issues.filter((issue) => issue.params.key === "removed");
    expect(removed.map((issue) => issue.pointer).sort()).toEqual([
      "companies[0].subName",
      "floatPercent",
      "info.capitalization",
    ]);
    for (const issue of removed) {
      expect(issue).toMatchObject({ severity: "warning", code: "deprecated" });
    }
  });

  it.each(renames)("warns about $old", async ({ old, key }) => {
    const issues = await validateGame(deprecatedGame());
    expect(issues.find((issue) => issue.pointer === old)).toEqual({
      severity: "warning",
      code: "deprecated",
      pointer: old,
      params: { key },
    });
  });

  it.each(renames)(
    "lists $old in 18Broken as deprecated",
    async ({ old, key }) => {
      const issues = await validateGame(games["18Broken"]);
      expect(
        issues.find(
          (issue) => issue.pointer === old && issue.code === "deprecated",
        ),
      ).toMatchObject({ severity: "warning", params: { key } });
    },
  );

  it("warns only about the old names", async () => {
    const issues = await validateGame(deprecatedGame());
    expect(issues.map((issue) => issue.pointer).sort()).toEqual(
      renames.map((r) => r.old).sort(),
    );
  });

  it("does not warn when a game uses the new names", async () => {
    expect(await validateGame(renamedGame())).toEqual([]);
  });

  it("checks the values of the config of the game against the config schema", async () => {
    const game = (config) => ({ ...validGame(), config });
    expect(await validateGame(game({ margin: 10 }))).toEqual([]);

    const issues = await validateGame(
      game({ fonts: { roles: { title: { size: "big" } } } }),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      severity: "error",
      code: "type",
      pointer: "config.fonts.roles.title.size",
    });

    const unknown = await validateGame(
      game({ fonts: { roles: { title: { colour: "red" } } } }),
    );
    expect(unknown.map((issue) => issue.pointer)).toEqual([
      "config.fonts.roles.title.colour",
    ]);
  });

  it("reports an unknown setting of the config of the game once", async () => {
    const issues = await validateGame({ ...validGame(), config: { fnts: {} } });
    expect(issues.map((issue) => issue.pointer)).toEqual(["config.fnts"]);
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
      expect(
        deprecatedPaths(schema)
          .map((path) => path.join("."))
          .sort(),
      ).toEqual(
        [
          "info.titleSize",
          "info.subtitleSize",
          "info.designerSize",
          "phases.*.buy_companies",
          "phases.*.events.close_companies",
          "phases.*.events.remove_tokens",
          "trains.*.quantity_label",
          "number_cards",
          "exports.paginated",
        ].sort(),
      );
    });
  });

  describe("the removed fields", () => {
    const token = (fields) => ({ tokens: [{ label: "A", ...fields }] });
    // A game with the field, the pointer of the field and whether the schema
    // allows it (an open object, like a company, never rejected it)
    const cases = [
      ["pools", { pools: [] }, "pools"],
      ["floatPercent", { floatPercent: 50 }, "floatPercent"],
      ["upgrades", { upgrades: {} }, "upgrades"],
      [
        "info.capitalization",
        { info: { title: "x", capitalization: "full" } },
        "info.capitalization",
      ],
      [
        "info.mustSellInBlocks",
        { info: { title: "x", mustSellInBlocks: true } },
        "info.mustSellInBlocks",
      ],
      [
        "companies.*.subName",
        { companies: [{ name: "A", abbrev: "A", color: "red", subName: "x" }] },
        "companies[0].subName",
        true,
      ],
      [
        "trains.*.discount",
        { trains: [{ name: "5", color: "gray", quantity: 1, discount: {} }] },
        "trains[0].discount",
      ],
      ...["sym", "debt", "abilities", "image"].map((field) => [
        `privates.*.${field}`,
        { privates: [{ name: "P", [field]: 1 }] },
        `privates[0].${field}`,
      ]),
      ...["tiles", "map"].flatMap((section) => {
        const place = (fields, path) =>
          section === "tiles"
            ? [{ tiles: { D5: fields } }, `tiles.D5${path}`]
            : [
                { map: { hexes: [{ hexes: ["A1"], ...fields }] } },
                `map.hexes[0]${path}`,
              ];
        return [
          ...["encoding", "broken"].map((field) => [
            `${section}.**.${field}`,
            ...place({ [field]: true }, `.${field}`),
          ]),
          ...["bgFill", "inverseTextColor"].map((field) => [
            `${section}.**.${field}`,
            ...place(token({ [field]: "red" }), `.tokens[0].${field}`),
          ]),
          ...["text", "textColor"].map((field) => [
            `${section}.**.tokens.*.${field}`,
            ...place(token({ [field]: "x" }), `.tokens[0].${field}`),
          ]),
          ...["textBorderWidth", "textBorderColor"].map((field) => [
            `${section}.**.${field}`,
            ...place(
              { shapes: [{ shape: "circle", [field]: 1 }] },
              `.shapes[0].${field}`,
            ),
          ]),
          [
            `${section}.**.groups`,
            ...place({ cities: [{ groups: ["a"] }] }, ".cities[0].groups"),
          ],
        ];
      }),
    ];

    it("has a case for every removed field", () => {
      const covered = new Set(cases.map(([name]) => name));
      for (const [parent, fields] of REMOVED) {
        for (const field of fields) {
          expect(covered.has([...parent, field].join("."))).toBe(true);
        }
      }
    });

    it.each(cases)(
      "warns for %s, once and without a suggestion",
      async (_, game, pointer) => {
        const issues = await validateGame({ info: { title: "x" }, ...game });
        expect(
          issues.filter((issue) =>
            issue.pointer.endsWith(pointer.split(".").pop()),
          ),
        ).toEqual([
          {
            severity: "warning",
            code: "deprecated",
            pointer,
            params: { key: "removed" },
          },
        ]);
      },
    );

    it.each(cases.filter(([, , , open]) => !open))(
      "is not allowed by the schema any more: %s",
      async (_, game, pointer) => {
        // A field the schema still allowed would be reported by nobody
        const { compiled } = await import("@/schemas/game.schema.json").then(
          async (game_) => {
            const [{ compileSchema, draft07 }, tiles] = await Promise.all([
              import("json-schema-library"),
              import("@/schemas/tiles.defs.json"),
            ]);
            return {
              compiled: compileSchema(game_.default, {
                drafts: [draft07],
                remotes: [tiles.default],
              }),
            };
          },
        );
        const errors = compiled
          .validate({ info: { title: "x" }, ...game })
          .errors.flatMap((e) => leaves(e));
        expect(
          errors.some((e) => readablePointer(e.data.pointer) === pointer),
        ).toBe(true);
      },
    );

    it("finds the removed fields of the data by their path", () => {
      expect(
        removedPointers({
          trains: [{ discount: 1 }, {}],
          privates: [{ discount: 1, image: 2 }],
          tiles: { D5: { broken: true, cities: [{ text: "x" }] } },
          players: [{ pools: 1 }],
          pools: [],
          "a/b": 1,
        }),
      ).toEqual([
        "#/pools",
        "#/trains/0/discount",
        "#/privates/0/image",
        "#/tiles/D5/broken",
      ]);
      expect(removedPointers({ trains: "x", tiles: 1 })).toEqual([]);
    });

    it("reports a token with removed fields once each, without noise", async () => {
      const issues = await validateGame({
        info: { title: "x" },
        tiles: {
          D5: token({ color: "red", bgFill: "red", inverseTextColor: "x" }),
        },
      });
      expect(issues).toEqual([
        {
          severity: "warning",
          code: "deprecated",
          pointer: "tiles.D5.tokens[0].bgFill",
          params: { key: "removed" },
        },
        {
          severity: "warning",
          code: "deprecated",
          pointer: "tiles.D5.tokens[0].inverseTextColor",
          params: { key: "removed" },
        },
      ]);
    });

    it("still reports an unknown field of a token", async () => {
      const issues = await validateGame({
        info: { title: "x" },
        tiles: { D5: token({ bogus: 1 }) },
      });
      expect(issues).toEqual([
        {
          severity: "error",
          code: "unknown-field",
          pointer: "tiles.D5.tokens[0].bogus",
          params: { field: "bogus" },
        },
      ]);
    });

    it("still reports a company token with an unknown field", async () => {
      const bad = { color: "yellow", tokens: [{ company: "A", label: "x" }] };
      for (const extra of [{}, { bgFill: "red" }]) {
        const issues = await validateGame({
          info: { title: "x" },
          tiles: { 1: { ...bad, tokens: [{ ...bad.tokens[0], ...extra }] } },
        });
        expect(
          issues.filter((i) => i.severity === "error").map((i) => i.pointer),
        ).toContain("tiles[1].tokens[0].label");
      }
    });

    it("keeps the errors before the removed fields", async () => {
      const issues = await validateGame({
        info: { title: "x" },
        pools: [],
        stock: { marekt: 10 },
      });
      expect(issues.map((issue) => issue.code)).toEqual([
        "unknown-field-suggest",
        "deprecated",
      ]);
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

  describe("custom images", () => {
    const game = {
      tokens: [
        { icon: "custom/star" },
        { logo: "custom/crest" },
        { icon: "boat" },
      ],
      companies: [
        { name: "A", logo: "custom/crest", token: { icon: "custom/gone" } },
      ],
      trains: [
        { name: "2", image: "custom/loco" },
        { name: "3", image: "3T" },
      ],
      map: {
        hexes: {
          plain: {
            icons: [{ type: "custom/star" }, { type: "boat" }],
            terrain: [{ type: "custom/mud" }],
            hexes: ["A1"],
          },
          city: { color: "plain", icons: { 1: "custom/star" }, hexes: ["A2"] },
          single: { terrain: { type: "custom/pit" }, hexes: ["A3"] },
        },
      },
      // Not an image reference
      info: { description: "custom/star", image: "custom/nothing" },
    };

    it("finds the references with their kind and pointer", () => {
      expect(
        customReferences(game).map(({ kind, id, pointer }) => [
          kind,
          id,
          pointer,
        ]),
      ).toEqual([
        ["icons", "custom/star", "#/tokens/0/icon"],
        ["logos", "custom/crest", "#/tokens/1/logo"],
        ["logos", "custom/crest", "#/companies/0/logo"],
        ["icons", "custom/gone", "#/companies/0/token/icon"],
        ["trains", "custom/loco", "#/trains/0/image"],
        ["icons", "custom/star", "#/map/hexes/plain/icons/0/type"],
        ["icons", "custom/mud", "#/map/hexes/plain/terrain/0/type"],
        ["icons", "custom/star", "#/map/hexes/city/icons/1"],
        ["icons", "custom/pit", "#/map/hexes/single/terrain/type"],
      ]);
    });

    it("warns about the ones the game does not have", () => {
      const assets = {
        icons: { star: "x", mud: "x" },
        logos: { crest: "x" },
        trains: {},
      };
      expect(
        assetIssues(game, assets).map(({ code, severity, pointer, params }) => [
          code,
          severity,
          pointer,
          params.id,
        ]),
      ).toEqual([
        ["missing-asset", "warning", "companies[0].token.icon", "custom/gone"],
        ["missing-asset", "warning", "trains[0].image", "custom/loco"],
        [
          "missing-asset",
          "warning",
          "map.hexes.single.terrain.type",
          "custom/pit",
        ],
      ]);
    });

    it("finds an image by its own name only", () => {
      const assets = { icons: Object.create(null), logos: {}, trains: {} };
      const data = {
        tokens: [{ icon: "custom/__proto__" }, { icon: "custom/toString" }],
      };
      expect(assetIssues(data, assets)).toHaveLength(2);
    });

    it("finds no problem in 18Test with its images, and checks them only when given", async () => {
      expect(
        await validateGame(games["18Test"], bundledAssets["18Test"]),
      ).toEqual([]);
      const issues = await validateGame(games["18Test"], {});
      expect(issues.map((i) => i.params.id).sort()).toEqual([
        "custom/crest",
        "custom/loco",
        "custom/star",
      ]);
      expect(await validateGame(games["18Test"])).toEqual([]);
    });
  });

  describe("train references", () => {
    const pointers = (trains) =>
      trainReferenceIssues({ trains }).map((i) => i.pointer);

    it("warns about a name no train has", () => {
      expect(
        trainReferenceIssues({
          trains: [{ name: "2", rust: "4" }, { name: "3" }],
        }),
      ).toEqual([
        {
          severity: "warning",
          code: "missing-train",
          pointer: "trains[0].rust",
          params: { train: "2", event: "rust", name: "4" },
        },
      ]);
    });

    it("points at the item of a list and at the on of an object", () => {
      expect(
        pointers([
          { name: "2", phased: ["2", "9", { on: "8" }, { on: "2" }] },
          { name: "3", obsolete: { on: "7" } },
        ]),
      ).toEqual([
        "trains[0].phased[1]",
        "trains[0].phased[2].on",
        "trains[1].obsolete.on",
      ]);
    });

    it("checks rust, phased and obsolete", () => {
      const issues = trainReferenceIssues({
        trains: [{ name: "2", rust: "a", phased: "b", obsolete: "c" }],
      });
      expect(issues.map((i) => i.params.event)).toEqual([
        "rust",
        "phased",
        "obsolete",
      ]);
    });

    it("compares names as strings and knows the name of a back", () => {
      expect(
        pointers([
          { name: 2, rust: "3" },
          { name: "3", back: { name: "D" }, phased: ["D", 2] },
        ]),
      ).toEqual([]);
    });

    it("knows the trains of a company", () => {
      const missing = (companies) =>
        trainReferenceIssues({
          trains: [{ name: "2", rust: "S" }],
          companies,
        });
      expect(missing([{ trains: ["S"] }])).toEqual([]);
      expect(missing([{ trains: [{ name: "S" }] }])).toEqual([]);
      expect(missing([{ trains: [{ name: "S", price: 50 }] }])).toEqual([]);
      expect(missing([{ trains: [{ name: "S", quantity: 2 }] }])).toEqual([]);
      expect(
        missing([{ trains: [{ name: "X", back: { name: "S" } }] }]),
      ).toEqual([]);
      expect(
        missing([{ trains: [{ name: "X", back: { name: "S", price: 1 } }] }]),
      ).toEqual([]);
      const trains = [{ name: "2", rust: 5 }];
      expect(
        trainReferenceIssues({
          trains,
          companies: [{ trains: [{ name: 5 }] }],
        }),
      ).toEqual([]);
      expect(missing([{ trains: ["T"] }])).toEqual([
        {
          severity: "warning",
          code: "missing-train",
          pointer: "trains[0].rust",
          params: { train: "2", event: "rust", name: "S" },
        },
      ]);
    });

    it("adds nothing for a company train without a name", () => {
      const run = (companies, rust = "undefined") =>
        trainReferenceIssues({ trains: [{ name: "2", rust }], companies });
      expect(run([{ trains: [{}] }])).toHaveLength(1);
      expect(run([{ trains: [{ name: null }] }])).toHaveLength(1);
      expect(run([{ trains: [{ name: "X", back: "S" }] }], "S")).toHaveLength(
        1,
      );
      expect(run([{ trains: [{ name: "X", back: null }] }], "S")).toHaveLength(
        1,
      );
      expect(run([{ trains: [{ name: "X", back: {} }] }])).toHaveLength(1);
    });

    it("ignores companies that are not lists of trains", () => {
      const run = (companies) =>
        trainReferenceIssues({ trains: [{ name: "2" }], companies });
      expect(
        run([null, "A", { trains: false }, { trains: [null, 3] }]),
      ).toEqual([]);
      expect(run({ trains: ["S"] })).toEqual([]);
      expect(run("x")).toEqual([]);
    });

    it("labels a train without a name by its place", () => {
      expect(
        trainReferenceIssues({ trains: [{ rust: "x" }] })[0].params.train,
      ).toBe("#1");
    });

    it("ignores values that are not names, and games without trains", () => {
      expect(
        pointers([
          { name: "2", rust: [true, null, { on: 5 }, {}], phased: true },
        ]),
      ).toEqual(["trains[0].rust[2].on"]);
      expect(trainReferenceIssues({})).toEqual([]);
      expect(trainReferenceIssues({ trains: "2" })).toEqual([]);
      expect(pointers([null, "2", { name: "2", rust: "2" }])).toEqual([]);
    });

    describe("train index", () => {
      const bad = (trains) =>
        trainReferenceIssues({ trains }).filter(
          (i) => i.code === "bad-train-index",
        );

      it("warns about an index above the number of trains", () => {
        expect(
          bad([{ name: "2", quantity: 2, phased: { on: "2", index: 3 } }]),
        ).toEqual([
          {
            severity: "warning",
            code: "bad-train-index",
            pointer: "trains[0].phased.index",
            params: {
              train: "2",
              event: "phased",
              name: "2",
              index: 3,
              count: 2,
            },
          },
        ]);
      });

      it("accepts an index equal to the number of trains", () => {
        expect(
          bad([{ name: "2", quantity: 2, rust: { on: "2", index: 2 } }]),
        ).toEqual([]);
      });

      it("sums the quantity of trains with the same name", () => {
        const trains = [
          { name: "4", quantity: 2 },
          { name: "4", quantity: 3, rust: { on: "4", index: 5 } },
        ];
        expect(bad(trains)).toEqual([]);
        trains[1].rust.index = 6;
        expect(bad(trains)[0].params.count).toBe(5);
      });

      it("counts a missing quantity as 1", () => {
        expect(bad([{ name: "2", rust: { on: "2", index: 2 } }])).toHaveLength(
          1,
        );
        expect(bad([{ name: "2", rust: { on: "2", index: 1 } }])).toEqual([]);
      });

      it("never warns for an infinite quantity", () => {
        expect(
          bad([{ name: "D", quantity: "∞", rust: { on: "D", index: 99 } }]),
        ).toEqual([]);
        expect(
          bad([
            { name: "D", quantity: "∞", rust: { on: "D", index: 99 } },
            { name: "D", quantity: 2 },
          ]),
        ).toEqual([]);
      });

      it("skips a quantity it does not recognise", () => {
        expect(
          bad([{ name: "2", quantity: "abc", rust: { on: "2", index: 9 } }]),
        ).toEqual([]);
      });

      it("gives only missing-train for a name the game lacks", () => {
        const issues = trainReferenceIssues({
          trains: [{ name: "2", rust: { on: "9", index: 5 } }],
        });
        expect(issues.map((i) => i.code)).toEqual(["missing-train"]);
      });

      it("gives nothing for the name of a back only", () => {
        expect(
          bad([
            {
              name: "3",
              back: { name: "D" },
              rust: { on: "D", index: 4 },
            },
          ]),
        ).toEqual([]);
      });

      it("compares names as strings", () => {
        expect(
          bad([{ name: 2, quantity: 2, rust: { on: "2", index: 3 } }]),
        ).toHaveLength(1);
        expect(
          bad([{ name: "2", quantity: 2, rust: { on: 2, index: 3 } }]),
        ).toHaveLength(1);
      });

      it("points at the item of a list and checks several objects", () => {
        expect(
          bad([
            {
              name: "2",
              quantity: 2,
              phased: [
                { on: "2", index: 1 },
                { on: "2", index: 3 },
                "2",
                { on: "2", index: 4 },
              ],
            },
          ]).map((i) => i.pointer),
        ).toEqual(["trains[0].phased[1].index", "trains[0].phased[3].index"]);
      });

      it("ignores an index that is not an integer", () => {
        expect(
          bad([
            {
              name: "2",
              rust: [
                { on: "2", index: 1.5 },
                { on: "2", index: "3" },
                { on: "2" },
              ],
            },
          ]),
        ).toEqual([]);
      });
    });

    it("finds the bad train index of 18Broken", async () => {
      const issues = await validateGame(games["18Broken"]);
      expect(
        issues
          .filter((i) => i.code === "bad-train-index")
          .map((i) => [i.severity, i.pointer, i.params.count]),
      ).toEqual([["warning", "trains[0].phased[2].index", 2]]);
    });

    it("finds the dangling names of 18Broken", async () => {
      const issues = await validateGame(games["18Broken"]);
      expect(
        issues
          .filter((i) => i.code === "missing-train")
          .map((i) => [i.severity, i.pointer, i.params.name]),
      ).toEqual([
        ["warning", "trains[0].rust", "9"],
        ["warning", "trains[0].phased[0]", "8"],
        ["warning", "trains[0].phased[1].on", "7"],
        ["warning", "trains[0].obsolete", "6"],
      ]);
    });

    it("is part of validateGame without the images", async () => {
      const game = {
        ...validGame(),
        trains: [
          { name: "2", price: 80, quantity: 1, color: "yellow", rust: "4" },
        ],
      };
      const issues = await validateGame(game);
      expect(issues.map((i) => i.code)).toEqual(["missing-train"]);
    });
  });
});
