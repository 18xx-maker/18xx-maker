import schema from "@/schemas/game.schema.json";
import {
  COMPANY_PRIMARY_KEYS,
  GAME_INFO_KEYS,
  PHASE_PRIMARY_KEYS,
  PLAYER_KEYS,
  PLAYER_PRIMARY_KEYS,
  ROUND_KEYS,
  TOKEN_KEYS,
  clearValue,
  coerceStringOrNumber,
  defaultValue,
  formatLines,
  formatList,
  formatRevenue,
  freeKey,
  humanize,
  insertAt,
  insertKey,
  isReferenceValue,
  isRequired,
  issuesFor,
  kindOf,
  mixedItem,
  moveItem,
  newItem,
  nextAbbrev,
  nextId,
  nextName,
  nextNumber,
  parseLimit,
  parseLines,
  parseList,
  parseRevenue,
  referenceList,
  referenceOf,
  referenceValue,
  removeAt,
  removeKey,
  renameKey,
  resolveAllOf,
  resolveSchema,
  sameList,
  schemaAt,
  setValue,
  valueAt,
} from "./resolve";

describe("resolveSchema", () => {
  it("follows a local $ref, a description next to it wins", () => {
    const root = {
      definitions: { link: { type: "string", description: "A link" } },
    };
    expect(resolveSchema({ $ref: "#/definitions/link" }, root)).toEqual({
      type: "string",
      description: "A link",
    });
    expect(
      resolveSchema({ $ref: "#/definitions/link", description: "Mine" }, root)
        .description,
    ).toBe("Mine");
  });

  it("leaves an unknown or external $ref alone", () => {
    const root = { definitions: {} };
    expect(resolveSchema({ $ref: "#/definitions/none" }, root)).toEqual({
      $ref: "#/definitions/none",
    });
    expect(resolveSchema({ $ref: "other.json#/x" }, root)).toEqual({
      $ref: "other.json#/x",
    });
  });
});

describe("kindOf", () => {
  it.each([
    [{ type: "string" }, "x", "string"],
    [{ type: "string" }, "notes", "text"],
    [{ type: "array", items: { type: "object" } }, "abilities", "json"],
    [
      {
        oneOf: [
          { type: "number" },
          { type: "array", items: { type: "number" } },
          { type: "string" },
        ],
      },
      "x",
      "revenue",
    ],
    [{ type: "number" }, "x", "number"],
    [{ type: "integer" }, "x", "number"],
    [{ type: "boolean" }, "x", "boolean"],
    [{ type: "string", enum: ["a"] }, "x", "enum"],
    [{ enum: [1, 2] }, "x", "json"],
    [
      { oneOf: [{ type: "string" }, { type: "number" }] },
      "x",
      "stringOrNumber",
    ],
    [{ oneOf: [{ type: "string" }, { type: "boolean" }] }, "x", "json"],
    [{ type: "object", properties: {} }, "x", "object"],
    [{ type: "object" }, "x", "json"],
    [{ type: "array", items: {} }, "x", "json"],
    [{ anyOf: [{ type: "string" }] }, "x", "json"],
    [{ $ref: "other" }, "x", "json"],
    [undefined, "x", "json"],
  ])("%j (%s) is %s", (node, key, kind) => {
    expect(kindOf(node, key)).toBe(kind);
  });

  it("reads two or more scalar alternatives with a number and text as stringOrNumber", () => {
    const text = { type: "string", pattern: "^x$" };
    expect(
      kindOf({ oneOf: [{ type: "integer" }, text, { type: "string" }] }, "x"),
    ).toBe("stringOrNumber");
    // Only a choice of text next to the number is a count
    expect(
      kindOf(
        { oneOf: [{ type: "integer" }, { type: "string", enum: ["∞"] }] },
        "quantity",
      ),
    ).toBe("count");
    // Without text that is free, or with something that is not scalar
    expect(
      kindOf(
        {
          oneOf: [
            { type: "number" },
            { type: "string", enum: ["a"] },
            { type: "string", enum: ["b"] },
          ],
        },
        "x",
      ),
    ).toBe("json");
    expect(
      kindOf(
        {
          oneOf: [{ type: "string" }, { type: "boolean" }, { type: "number" }],
        },
        "x",
      ),
    ).toBe("json");
    expect(
      kindOf(
        { oneOf: [{ type: "number" }, { type: "string" }, { type: "object" }] },
        "x",
      ),
    ).toBe("json");
    // The certificate limit is number or text
    expect(
      kindOf(
        resolveSchema(schema.definitions.numberOrSlash, schema),
        "certLimit",
      ),
    ).toBe("stringOrNumber");
  });

  it("reads a text or a list of texts as stringList, in either order", () => {
    const string = { type: "string" };
    const list = { type: "array", items: { type: "string" } };
    expect(kindOf({ oneOf: [string, list] }, "notes")).toBe("stringList");
    expect(kindOf({ oneOf: [list, string] }, "train")).toBe("stringList");
    // A choice, a pattern or a $ref is something else
    expect(
      kindOf({ oneOf: [{ type: "string", enum: ["a"] }, list] }, "x"),
    ).toBe("json");
    expect(
      kindOf({ oneOf: [{ type: "string", pattern: "^a" }, list] }, "x"),
    ).toBe("json");
    expect(
      kindOf(
        { oneOf: [string, { type: "array", items: { type: "number" } }] },
        "x",
      ),
    ).toBe("json");
    expect(
      kindOf(
        { oneOf: [string, { type: "array", items: { $ref: "#/x" } }] },
        "x",
      ),
    ).toBe("json");
    expect(kindOf({ oneOf: [string, list, { type: "boolean" }] }, "x")).toBe(
      "json",
    );
  });

  it("keeps the arrow of a cell and a train event as JSON", () => {
    const cell = resolveAllOf(schema.definitions.cellObject, schema);
    expect(
      kindOf(resolveAllOf(cell.properties.arrow, schema), "arrow", schema),
    ).toBe("json");
    expect(
      kindOf(resolveAllOf(schema.definitions.trainEvent, schema), "on", schema),
    ).toBe("json");
  });

  // Widening what a kind matches must not move a field of these sections
  it("pins the kind of every game info and train field", () => {
    const kinds = {};
    const walk = (node, keys) => {
      const resolved = resolveAllOf(node, schema);
      const kind = kindOf(resolved, keys[keys.length - 1], schema, keys);
      if (kind !== "object") {
        kinds[keys.join(".")] = kind;
        return;
      }
      Object.entries(resolved.properties).forEach(([key, child]) =>
        walk(child, [...keys, key]),
      );
    };
    GAME_INFO_KEYS.forEach((key) => walk(schema.properties[key], [key]));
    const train = resolveAllOf(schema.properties.trains.items, schema);
    Object.entries(train.properties).forEach(([key, child]) =>
      walk(child, ["trains", 0, key]),
    );
    expect(kinds).toEqual({
      "info.background": "string",
      "info.borderWidth": "number",
      "info.capitalization": "enum",
      "info.cityWidth": "number",
      "info.companyFontFamily": "string",
      "info.companyFontSize": "number",
      "info.companyFontStyle": "string",
      "info.companyFontWeight": "stringOrNumber",
      "info.currency": "string",
      "info.designer": "string",
      "info.designerFontFamily": "string",
      "info.designerFontWeight": "stringOrNumber",
      "info.designerSize": "number",
      "info.extraStationTokens": "number",
      "info.extraTotalHeight": "number",
      "info.extraTotalWidth": "number",
      "info.mapCoordinates": "enum",
      "info.marketTokens": "number",
      "info.mustSellInBlocks": "boolean",
      "info.nameFontFamily": "string",
      "info.nameFontSize": "number",
      "info.nameFontWeight": "stringOrNumber",
      "info.notes": "text",
      "info.orientation": "enum",
      "info.publisher": "string",
      "info.subtitle": "string",
      "info.subtitleFontFamily": "string",
      "info.subtitleFontWeight": "stringOrNumber",
      "info.subtitleSize": "number",
      "info.title": "string",
      "info.titleFontFamily": "string",
      "info.titleFontWeight": "stringOrNumber",
      "info.titleRotate": "number",
      "info.titleSize": "number",
      "info.titleX": "number",
      "info.titleY": "number",
      "info.townBorderWidth": "number",
      "info.townWidth": "number",
      "info.trackBorderColor": "string",
      "info.trackColor": "string",
      "info.trackGauge": "string",
      "info.trackGaugeColor": "string",
      "info.trackWidth": "number",
      "info.transparent": "boolean",
      "info.valueFontFamily": "string",
      "info.valueFontSize": "number",
      "info.valueFontWeight": "stringOrNumber",
      "links.bgg": "string",
      "links.license": "string",
      "links.purchase": "string",
      "links.rules": "string",
      prototype: "boolean",
      "trains.0.available": "string",
      "trains.0.backgroundColor": "string",
      "trains.0.color": "string",
      "trains.0.description": "text",
      "trains.0.discount": "record",
      "trains.0.image": "string",
      "trains.0.imagePaddingTop": "number",
      "trains.0.imageWidth": "number",
      "trains.0.longevityFontFamily": "string",
      "trains.0.longevityFontSize": "number",
      "trains.0.name": "string",
      "trains.0.nameFontFamily": "string",
      "trains.0.nameFontSize": "number",
      "trains.0.obsolete": "json",
      "trains.0.obsoletedText": "string",
      "trains.0.permanent": "boolean",
      "trains.0.permanentColor": "string",
      "trains.0.permanentText": "string",
      "trains.0.phase": "boolean",
      "trains.0.phased": "json",
      "trains.0.phasedText": "string",
      "trains.0.players": "number",
      "trains.0.price": "stringOrNumber",
      "trains.0.priceFontFamily": "string",
      "trains.0.priceFontSize": "number",
      "trains.0.priceFormat": "string",
      "trains.0.print": "number",
      "trains.0.quantity": "count",
      "trains.0.quantity_label": "string",
      "trains.0.rust": "json",
      "trains.0.rustedText": "string",
      "trains.0.tradeIn": "stringOrNumber",
      "trains.0.tradeInFormat": "string",
      "trains.0.upgrade": "stringOrNumber",
      "trains.0.upgradeFormat": "string",
      "trains.0.variant": "string",
      wip: "boolean",
    });
  });

  it("a description is text in trains and privates, one line elsewhere", () => {
    const node = { type: "string" };
    expect(
      kindOf(node, "description", schema, ["trains", 0, "description"]),
    ).toBe("text");
    expect(
      kindOf(node, "description", schema, ["privates", 0, "description"]),
    ).toBe("text");
    expect(
      kindOf(node, "description", schema, [
        "stock",
        "legend",
        0,
        "description",
      ]),
    ).toBe("string");
  });

  // A new construct in the schema must not silently end up as raw JSON
  it("gives every property of the edited sections a real form", () => {
    const unexpected = [];
    const walk = (node, keys) => {
      const resolved = resolveSchema(node, schema);
      const kind = kindOf(resolved, keys[keys.length - 1]);
      if (kind === "json") unexpected.push(keys.join("."));
      if (kind === "object") {
        Object.entries(resolved.properties).forEach(([key, child]) =>
          walk(child, [...keys, key]),
        );
      }
    };
    GAME_INFO_KEYS.forEach((key) => walk(schema.properties[key], [key]));
    expect(unexpected).toEqual([]);
  });

  it("reads trains as an array, the others of a train as real fields", () => {
    expect(kindOf(schema.properties.trains, "trains", schema)).toBe("array");
    // Without the root the items cannot be followed
    expect(kindOf(schema.properties.trains, "trains")).toBe("json");
    const train = resolveAllOf(schema.properties.trains.items, schema);
    const kinds = Object.fromEntries(
      Object.entries(train.properties).map(([key, node]) => [
        key,
        kindOf(resolveAllOf(node, schema), key, schema, ["privates", 0, key]),
      ]),
    );
    expect(kinds.name).toBe("string");
    expect(kinds.quantity).toBe("count");
    expect(kinds.price).toBe("stringOrNumber");
    expect(kinds.upgrade).toBe("stringOrNumber");
    expect(kinds.tradeIn).toBe("stringOrNumber");
    expect(kinds.players).toBe("number");
    expect(kinds.permanent).toBe("boolean");
    expect(kinds.priceFormat).toBe("string");
  });

  it("reads a number with a minimum next to a string as stringOrNumber", () => {
    expect(
      kindOf(
        {
          oneOf: [{ type: "number", minimum: 0 }, { type: "string" }],
        },
        "price",
      ),
    ).toBe("stringOrNumber");
  });

  // The fields of a train that still are JSON until they get a form
  it("lists the train fields that are a JSON textarea", () => {
    const train = resolveAllOf(schema.properties.trains.items, schema);
    const json = Object.entries(train.properties)
      .filter(
        ([key, node]) =>
          kindOf(resolveAllOf(node, schema), key, schema) === "json",
      )
      .map(([key]) => key);
    expect(json).toEqual(["rust", "phased", "obsolete"]);
  });

  it("reads the privates as an array, the fields of a private as real fields", () => {
    expect(kindOf(schema.properties.privates, "privates", schema)).toBe(
      "array",
    );
    const item = resolveAllOf(schema.properties.privates.items, schema);
    const kinds = Object.fromEntries(
      Object.entries(item.properties).map(([key, node]) => [
        key,
        kindOf(resolveAllOf(node, schema), key, schema, ["privates", 0, key]),
      ]),
    );
    expect(kinds.name).toBe("string");
    expect(kinds.price).toBe("stringOrNumber");
    expect(kinds.revenue).toBe("revenue");
    expect(kinds.company).toBe("string");
    expect(kinds.description).toBe("text");
    expect(kinds.abilities).toBe("json");
    expect(kinds.iconSize).toBe("number");
    expect(kinds.priceFormat).toBe("string");
  });

  it("lists the private fields that are a JSON textarea", () => {
    const item = resolveAllOf(schema.properties.privates.items, schema);
    const json = Object.entries(item.properties)
      .filter(
        ([key, node]) =>
          kindOf(resolveAllOf(node, schema), key, schema, [
            "privates",
            0,
            key,
          ]) === "json",
      )
      .map(([key]) => key);
    expect(json).toEqual(["token", "abilities"]);
  });

  it("reads the phases as an array, the fields of a phase as real fields", () => {
    expect(kindOf(schema.properties.phases, "phases", schema)).toBe("array");
    const item = resolveAllOf(schema.properties.phases.items, schema);
    const kinds = Object.fromEntries(
      Object.entries(item.properties).map(([key, node]) => [
        key,
        kindOf(resolveAllOf(node, schema), key, schema, ["phases", 0, key]),
      ]),
    );
    expect(kinds).toEqual({
      name: "string",
      minor: "boolean",
      company: "string",
      train: "stringList",
      limit: "limit",
      rounds: "number",
      tiles: "string",
      on: "json",
      notes: "stringList",
      buy_companies: "boolean",
      events: "object",
    });
    expect(Object.keys(kinds)).toEqual(
      expect.arrayContaining(PHASE_PRIMARY_KEYS),
    );
    const events = resolveAllOf(item.properties.events, schema);
    expect(
      Object.entries(events.properties).map(([key, node]) =>
        kindOf(resolveAllOf(node, schema), key, schema),
      ),
    ).toEqual(["boolean", "boolean"]);
  });

  it("lists the phase fields that are a JSON textarea", () => {
    const item = resolveAllOf(schema.properties.phases.items, schema);
    const json = Object.entries(item.properties)
      .filter(
        ([key, node]) =>
          kindOf(resolveAllOf(node, schema), key, schema) === "json",
      )
      .map(([key]) => key);
    expect(json).toEqual(["on"]);
  });

  it("reads the bank, the limits and the players as real fields", () => {
    const kinds = Object.fromEntries(
      PLAYER_KEYS.map((key) => [
        key,
        kindOf(resolveAllOf(schema.properties[key], schema), key, schema, [
          key,
        ]),
      ]),
    );
    expect(kinds).toEqual({
      bank: "stringOrNumber",
      capital: "stringOrNumber",
      certLimit: "stringOrNumber",
      floatPercent: "number",
    });
    expect(kindOf(schema.properties.players, "players", schema)).toBe("array");
    const item = resolveAllOf(schema.properties.players.items, schema);
    const itemKinds = Object.fromEntries(
      Object.entries(item.properties).map(([key, node]) => [
        key,
        kindOf(resolveAllOf(node, schema), key, schema, ["players", 0, key]),
      ]),
    );
    expect(itemKinds).toEqual({
      bank: "stringOrNumber",
      capital: "stringOrNumber",
      certLimit: "stringOrNumber",
      number: "number",
    });
    expect(Object.keys(itemKinds)).toEqual(
      expect.arrayContaining(PLAYER_PRIMARY_KEYS),
    );
  });

  it("reads a oneOf of only strings and numbers as text or number, other mixes stay JSON", () => {
    const of = (...types) => ({ oneOf: types.map((type) => ({ type })) });
    expect(kindOf(of("string", "number"), "x", schema)).toBe("stringOrNumber");
    expect(kindOf(of("string", "string", "number"), "x", schema)).toBe(
      "stringOrNumber",
    );
    expect(kindOf(of("string", "boolean"), "x", schema)).toBe("json");
    expect(kindOf(of("string", "string"), "x", schema)).toBe("json");
    expect(kindOf(of("number", "number"), "x", schema)).toBe("json");
  });

  it("reads the companies as an array, the fields of a company as real fields", () => {
    expect(kindOf(schema.properties.companies, "companies", schema)).toBe(
      "array",
    );
    const item = resolveAllOf(schema.properties.companies.items, schema);
    const kinds = Object.fromEntries(
      Object.entries(item.properties).map(([key, node]) => [
        key,
        kindOf(resolveAllOf(node, schema), key, schema, ["companies", 0, key]),
      ]),
    );
    expect(kinds.name).toBe("string");
    expect(kinds.abbrev).toBe("string");
    expect(kinds.color).toBe("string");
    expect(kinds.minor).toBe("boolean");
    expect(kinds.logo).toBe("string");
    expect(kinds.home).toBe("stringList");
    expect(kinds.marketTokens).toBe("number");
    expect(kinds.charterSubtitle).toBe("object");
    expect(Object.keys(kinds)).toEqual(
      expect.arrayContaining(COMPANY_PRIMARY_KEYS),
    );
  });

  // Until they get a form these are a JSON textarea: a field that is new to
  // the schema must not silently join them
  it("lists the company fields that are a JSON textarea", () => {
    const item = resolveAllOf(schema.properties.companies.items, schema);
    const json = Object.entries(item.properties)
      .filter(
        ([key, node]) =>
          kindOf(resolveAllOf(node, schema), key, schema, [
            "companies",
            0,
            key,
          ]) === "json",
      )
      .map(([key]) => key);
    expect(json).toEqual(["shares", "tokens", "loans", "trains", "token"]);
  });

  it("shows a property that is new to the schema without a component change", () => {
    const mock = {
      properties: {
        info: {
          type: "object",
          properties: {
            title: { type: "string" },
            fresh: { type: "number" },
            mode: { type: "string", enum: ["a", "b"] },
          },
        },
      },
    };
    const kinds = Object.fromEntries(
      Object.entries(mock.properties.info.properties).map(([key, node]) => [
        key,
        kindOf(node, key),
      ]),
    );
    expect(kinds).toEqual({ title: "string", fresh: "number", mode: "enum" });
  });
});

describe("helpers", () => {
  it("humanizes keys", () => {
    expect(humanize("titleFontWeight")).toBe("Title Font Weight");
    expect(humanize("bgg")).toBe("Bgg");
    expect(humanize("number_cards")).toBe("Number cards");
  });

  it("knows the required keys", () => {
    expect(isRequired(schema, ["info", "title"])).toBe(true);
    expect(isRequired(schema, ["info", "subtitle"])).toBe(false);
    expect(isRequired(schema, ["links", "bgg"])).toBe(false);
  });

  it("a key every branch of an anyOf requires is required", () => {
    expect(isRequired(schema, ["phases", 0, "limit"])).toBe(true);
    expect(isRequired(schema, ["phases", 0, "tiles"])).toBe(true);
    // The name or the train, not both
    expect(isRequired(schema, ["phases", 0, "name"])).toBe(false);
    expect(isRequired(schema, ["phases", 0, "train"])).toBe(false);
    expect(isRequired(schema, ["phases", 0, "notes"])).toBe(false);
    expect(isRequired(schema, ["trains", 0, "train"])).toBe(false);
  });

  it("knows the required keys of an item, with allOf merged", () => {
    expect(isRequired(schema, ["trains", 0, "quantity"])).toBe(true);
    expect(isRequired(schema, ["trains", 0, "name"])).toBe(true);
    expect(isRequired(schema, ["trains", 0, "price"])).toBe(false);
    expect(isRequired(schema, ["trains", "3", "color"])).toBe(true);
  });

  it("merges allOf into one node", () => {
    const root = {
      definitions: { a: { properties: { x: {} }, required: ["x"] } },
    };
    expect(
      resolveAllOf(
        {
          allOf: [{ $ref: "#/definitions/a" }, { required: ["y", "x"] }],
          description: "d",
        },
        root,
      ),
    ).toEqual({
      properties: { x: {} },
      required: ["x", "y"],
      description: "d",
    });
    expect(resolveAllOf({ type: "string" }, root)).toEqual({ type: "string" });
  });

  it("coerces only fully numeric text to a number", () => {
    expect(coerceStringOrNumber("700")).toBe(700);
    expect(coerceStringOrNumber(" 700 ")).toBe(700);
    expect(coerceStringOrNumber("1.5")).toBe(1.5);
    expect(coerceStringOrNumber("bold")).toBe("bold");
    expect(coerceStringOrNumber("700 bold")).toBe("700 bold");
    expect(coerceStringOrNumber("1e3")).toBe("1e3");
  });

  it("finds the problems of a field", () => {
    const issues = [
      { pointer: "info.currency" },
      { pointer: "info" },
      { pointer: "info.titleFont" },
      { pointer: "links.bgg" },
    ];
    expect(issuesFor(issues, ["info", "currency"])).toEqual([issues[0]]);
    expect(issuesFor(issues, ["info"], false)).toEqual([issues[1]]);
    expect(issuesFor(issues, ["info"])).toHaveLength(3);
    expect(issuesFor(undefined, ["info"])).toEqual([]);
  });

  it("finds the problems of an item by its pointer, not those of a longer index", () => {
    const issues = [
      { pointer: "trains[1].name" },
      { pointer: "trains[1]" },
      { pointer: "trains[10].name" },
      { pointer: "trains[10]" },
    ];
    expect(issuesFor(issues, ["trains", 1])).toEqual([issues[0], issues[1]]);
    expect(issuesFor(issues, ["trains", 1], false)).toEqual([issues[1]]);
    expect(issuesFor(issues, ["trains", 1, "name"])).toEqual([issues[0]]);
    expect(issuesFor(issues, ["trains"])).toHaveLength(4);
  });
});

describe("revenue", () => {
  it.each([
    ["5", 5],
    [" 5 ", 5],
    ["10/20", [10, 20]],
    ["10 / 20", [10, 20]],
    ["10, 20", [10, 20]],
    ["1,000", "1,000"],
    ["10/20/30", [10, 20, 30]],
    ["-5", -5],
    ["2.5", 2.5],
    ["$10/$20", "$10/$20"],
    ["10%/20%", "10%/20%"],
    ["abc", "abc"],
    ["10/", "10/"],
    ["", undefined],
    ["  ", undefined],
  ])("parses %j as %j", (text, value) => {
    expect(parseRevenue(text)).toEqual(value);
  });

  it("formats a list as the card prints it", () => {
    expect(formatRevenue([10, 20])).toBe("10/20");
    expect(formatRevenue(5)).toBe("5");
    expect(formatRevenue("$10/$20")).toBe("$10/$20");
    expect(formatRevenue(undefined)).toBe("");
    expect(parseRevenue(formatRevenue([10, 20]))).toEqual([10, 20]);
  });
});

describe("one text a line", () => {
  it.each([
    ["", undefined],
    ["  \n \n", undefined],
    ["4H", "4H"],
    ["  4H  ", "4H"],
    ["4H\n2M", ["4H", "2M"]],
    ["4H\r\n\n  2M \n", ["4H", "2M"]],
  ])("parses %j as %j", (text, value) => {
    expect(parseList(text)).toEqual(value);
  });

  it("formats a list a line each, a string as it is", () => {
    expect(formatList(["4H", "2M"])).toBe("4H\n2M");
    expect(formatList("4H")).toBe("4H");
    expect(formatList(undefined)).toBe("");
  });

  it("round trips what it formats", () => {
    for (const value of ["4H", ["4H", "2M"]]) {
      expect(parseList(formatList(value))).toEqual(value);
    }
  });

  it("a list of one line is the same as that line", () => {
    expect(sameList("4H", "4H")).toBe(true);
    expect(sameList("4H", ["4H"])).toBe(true);
    expect(sameList("4H\n2M", ["4H", "2M"])).toBe(true);
    expect(sameList("4H\n2M", "4H")).toBe(false);
    expect(sameList("4H", ["4H", "2M"])).toBe(false);
    expect(sameList("", undefined)).toBe(true);
    expect(sameList("4H", undefined)).toBe(false);
  });
});

describe("parseLimit", () => {
  it.each([
    ["4", 4],
    [" 12 ", 12],
    ["∞", "∞"],
    ["3/4", "3/4"],
    [" 3/4 ", "3/4"],
    ["0", undefined],
    ["-1", undefined],
    ["2.5", undefined],
    ["3 / 4", undefined],
    ["12/4", undefined],
    ["many", undefined],
  ])("parses %j as %j", (text, value) => {
    expect(parseLimit(text)).toBe(value);
  });
});

describe("setValue and clearValue", () => {
  const game = {
    meta: { id: "x" },
    info: { title: "A", subtitle: "B" },
    links: { bgg: "https://a.b" },
    extra: { keep: 1 },
  };

  it("sets a value and keeps the rest", () => {
    const next = setValue(game, ["info", "subtitle"], "C");
    expect(next.info).toEqual({ title: "A", subtitle: "C" });
    expect(next.meta).toBe(game.meta);
    expect(next.extra).toBe(game.extra);
  });

  it("creates the parent of a value", () => {
    expect(
      setValue({ info: {} }, ["links", "bgg"], "https://x.y").links,
    ).toEqual({ bgg: "https://x.y" });
  });

  it("removes the key, not the info", () => {
    expect(clearValue(game, ["info", "subtitle"]).info).toEqual({ title: "A" });
    expect(clearValue({ info: { a: 1 } }, ["info", "a"])).toEqual({ info: {} });
  });

  it("removes an object the clear emptied", () => {
    const next = clearValue(game, ["links", "bgg"]);
    expect("links" in next).toBe(false);
    expect(next.info).toBe(game.info);
  });

  it("keeps an object that was already empty", () => {
    const empty = { info: { title: "A" }, links: {} };
    expect(clearValue(empty, ["links", "bgg"])).toBe(empty);
    expect(clearValue(empty, ["info", "subtitle"])).toBe(empty);
  });

  it("keeps an object that still has keys", () => {
    const two = { info: { title: "A" }, links: { bgg: "a", rules: "b" } };
    expect(clearValue(two, ["links", "bgg"]).links).toEqual({ rules: "b" });
  });
});

describe("numbered items", () => {
  it("the next number is the highest plus one, as a number", () => {
    expect(nextNumber([])).toBe(1);
    expect(nextNumber(undefined)).toBe(1);
    expect(nextNumber([{ number: 2 }, { number: 5 }, { number: 3 }])).toBe(6);
    expect(nextNumber([{ number: "4" }, {}, { number: 2 }])).toBe(3);
    expect(nextNumber([{ n: 7 }], "n")).toBe(8);
  });

  it("an id is a name or a number, the name is unchanged", () => {
    expect(nextId([{ name: "1" }])).toBe("2");
    expect(nextId([{ number: 2 }], "number")).toBe(3);
    expect(nextName([{ name: "1" }, { name: "2" }])).toBe("3");
    expect(newItem([{ number: 4 }], {}, true, "number")).toEqual({ number: 5 });
    expect(newItem([{ name: "1" }], { x: 1 })).toEqual({ name: "2", x: 1 });
  });
});

describe("lists", () => {
  const game = { trains: [{ name: "a" }, { name: "b" }, { name: "c" }], x: 1 };

  it("inserts without changing the game, and creates the list", () => {
    const next = insertAt(game, ["trains"], 1, { name: "n" });
    expect(next.trains.map((t) => t.name)).toEqual(["a", "n", "b", "c"]);
    expect(game.trains).toHaveLength(3);
    expect(next.trains[0]).toBe(game.trains[0]);
    expect(insertAt({}, ["trains"], 0, { name: "n" })).toEqual({
      trains: [{ name: "n" }],
    });
    expect(insertAt(game, ["trains"], 99, { name: "z" }).trains[3].name).toBe(
      "z",
    );
    expect(insertAt(game, ["trains"], -4, { name: "z" }).trains[0].name).toBe(
      "z",
    );
  });

  it("removes, and removes the list that this empties", () => {
    expect(removeAt(game, ["trains"], 0).trains.map((t) => t.name)).toEqual([
      "b",
      "c",
    ]);
    expect(game.trains).toHaveLength(3);
    expect(
      "trains" in removeAt({ trains: [{ name: "a" }], x: 1 }, ["trains"], 0),
    ).toBe(false);
    expect(removeAt(game, ["trains"], 3)).toBe(game);
    expect(removeAt(game, ["trains"], -1)).toBe(game);
    expect(removeAt({}, ["trains"], 0)).toEqual({});
  });

  it("moves, and is the same game when nothing moves", () => {
    expect(moveItem(game, ["trains"], 0, 2).trains.map((t) => t.name)).toEqual([
      "b",
      "c",
      "a",
    ]);
    expect(moveItem(game, ["trains"], 2, 1).trains.map((t) => t.name)).toEqual([
      "a",
      "c",
      "b",
    ]);
    expect(game.trains.map((t) => t.name)).toEqual(["a", "b", "c"]);
    expect(moveItem(game, ["trains"], 1, 1)).toBe(game);
    expect(moveItem(game, ["trains"], 0, 3)).toBe(game);
    expect(moveItem(game, ["trains"], -1, 0)).toBe(game);
    expect(moveItem({}, ["trains"], 0, 1)).toEqual({});
  });

  it("names a new item with the first unused number", () => {
    expect(nextName(undefined)).toBe("1");
    expect(nextName([{ name: "2" }])).toBe("3");
    expect(nextName([{ name: "2" }, { name: "3" }])).toBe("4");
    expect(nextName([{ name: "3" }, { name: "2" }, { name: "x" }])).toBe("4");
    expect(nextName([{ train: "2" }, { train: ["3", "4"] }], "train")).toBe(
      "5",
    );
    expect(nextName([{ train: ["2", "3"] }, { limit: 4 }], "train")).toBe("4");
  });

  it("makes an item with the defaults of its list and a free name", () => {
    expect(newItem([])).toEqual({ name: "1" });
    expect(newItem([{ name: "1" }], { color: "gray", quantity: 1 })).toEqual({
      name: "2",
      color: "gray",
      quantity: 1,
    });
  });

  it("takes the defaults of a list from a function of its items", () => {
    const defaults = (items) => ({ abbrev: `A${items.length}` });
    expect(newItem([{ name: "1" }, { name: "2" }], defaults)).toEqual({
      name: "3",
      abbrev: "A2",
    });
    expect(newItem([], defaults, false)).toEqual({ abbrev: "A0" });
  });

  it("makes an abbreviation no item has, whatever the case", () => {
    expect(nextAbbrev([])).toBe("NEW");
    expect(nextAbbrev(undefined)).toBe("NEW");
    expect(nextAbbrev([{ abbrev: "NEW" }, { name: "x" }])).toBe("NEW2");
    expect(nextAbbrev([{ abbrev: "new" }, { abbrev: "New2" }])).toBe("NEW3");
    expect(nextAbbrev([{ abbrev: "PRR" }], "PRR")).toBe("PRR2");
    expect(nextAbbrev([{ abbrev: "prr" }, { abbrev: "PRR2" }], "PRR")).toBe(
      "PRR3",
    );
    // A base that is not a string is ignored
    expect(nextAbbrev([{ abbrev: 3 }], 3)).toBe("NEW");
    expect(nextAbbrev([{ abbrev: "NEW" }], 3)).toBe("NEW2");
    // A number the base ends with is not kept
    expect(nextAbbrev([{ abbrev: "PRR" }, { abbrev: "PRR2" }], "PRR2")).toBe(
      "PRR3",
    );
    // A base that is only a number stays whole
    expect(nextAbbrev([{ abbrev: "7" }], "7")).toBe("72");
    expect(nextAbbrev([{ abbrev: "PRR" }], "ABC")).toBe("ABC");
  });

  describe("with names only where the list has them", () => {
    const defaults = { limit: 4, tiles: "yellow" };

    it("names a phase when the others are named, or there are none", () => {
      expect(newItem([], defaults, "named")).toEqual({
        name: "1",
        ...defaults,
      });
      expect(
        newItem([{ name: "2" }, { train: "3" }], defaults, "named"),
      ).toEqual({ name: "3", ...defaults });
    });

    it("gives a phase a train, not a name, when the others are keyed by train", () => {
      expect(
        newItem([{ train: "2" }, { train: ["3", "4"] }], defaults, "named"),
      ).toEqual({ ...defaults, train: "5" });
      expect(newItem([{ train: "2" }], defaults, "named")).toEqual({
        ...defaults,
        train: "3",
      });
    });
  });
});

describe("the market", () => {
  it("finds the schema of a cell field through rows, oneOf and $ref", () => {
    const value = schemaAt(schema, ["stock", "market", 1, 3, "value"]);
    expect(value.description).toMatch(/price shown/);
    // A flat market has the cell right under the list
    expect(schemaAt(schema, ["stock", "market", 3, "value"])).toEqual(value);
    expect(schemaAt(schema, ["stock", "market", 3, "legend"]).type).toBe(
      "integer",
    );
    // The row of a 2D market is a list, the cell of it an item
    expect(schemaAt(schema, ["stock", "market", 1]).oneOf).toBeDefined();
    expect(schemaAt(schema, ["stock", "market", 1, 3]).oneOf).toBeDefined();
    expect(schemaAt(schema, ["stock", "market", 1, 3, "nope"])).toBeUndefined();
    expect(schemaAt(schema, ["stock", "legend", 0, "description"]).type).toBe(
      "string",
    );
  });

  it("reads the cell fields as real fields, except arrow, companies and tokens", () => {
    const kinds = Object.fromEntries(
      Object.keys(schema.definitions.cellObject.properties).map((key) => [
        key,
        kindOf(schemaAt(schema, ["stock", "market", 0, 0, key]), key, schema),
      ]),
    );
    expect(kinds).toMatchObject({
      value: "stringOrNumber",
      label: "stringOrNumber",
      color: "string",
      legend: "number",
      par: "boolean",
      width: "number",
    });
    expect(Object.keys(kinds).filter((key) => kinds[key] === "json")).toEqual([
      "arrow",
      "companies",
      "tokens",
    ]);
  });

  it("no cell field is required, a number is a valid segment", () => {
    expect(isRequired(schema, ["stock", "market", 1, 3, "value"])).toBe(false);
    expect(isRequired(schema, ["stock", "legend", 0, "description"])).toBe(
      true,
    );
  });

  it("finds the problems of a cell by the pointer the validation writes", () => {
    const issues = [
      { pointer: "stock.market[1][3].value" },
      { pointer: "stock.market[1][3]" },
      { pointer: "stock.market[1][30]" },
      { pointer: "stock.market[3].legend" },
    ];
    expect(issuesFor(issues, ["stock", "market", 1, 3, "value"])).toEqual([
      issues[0],
    ]);
    expect(issuesFor(issues, ["stock", "market", 1, 3])).toEqual([
      issues[0],
      issues[1],
    ]);
    expect(issuesFor(issues, ["stock", "market", 3, "legend"])).toEqual([
      issues[3],
    ]);
  });
});

describe("the kinds of a record, a list of texts and a list of choices", () => {
  const record = { type: "object", additionalProperties: { type: "string" } };

  it("reads an object of any names as a record, with $ref values and in the real schema", () => {
    expect(kindOf(record, "x", {})).toBe("record");
    expect(
      kindOf(
        {
          type: "object",
          additionalProperties: { $ref: "#/definitions/v" },
        },
        "x",
        { definitions: { v: { type: "string" } } },
      ),
    ).toBe("record");
    ["colors", "tokenTypes", "shareTypes", "upgrades"].forEach((key) =>
      expect(
        kindOf(resolveAllOf(schema.properties[key], schema), key, schema),
      ).toBe("record"),
    );
  });

  it("keeps an object with properties, and any other additionalProperties, as before", () => {
    expect(
      kindOf({ ...record, properties: { a: { type: "string" } } }, "x", {}),
    ).toBe("object");
    expect(
      kindOf({ type: "object", additionalProperties: true }, "x", {}),
    ).toBe("json");
    expect(kindOf({ type: "object", additionalProperties: {} }, "x", {})).toBe(
      "json",
    );
    expect(kindOf({ type: "object" }, "x", {})).toBe("json");
  });

  it("reads an array of plain strings as a list of texts, not a pattern or a choice", () => {
    expect(
      kindOf({ type: "array", items: { type: "string" } }, "x", schema),
    ).toBe("stringArray");
    expect(
      kindOf({ type: "array", items: { type: "string" } }, "x", undefined),
    ).toBe("stringArray");
    expect(
      kindOf(
        { type: "array", items: { type: "string", pattern: "^a" } },
        "x",
        schema,
      ),
    ).toBe("json");
    expect(
      kindOf(resolveAllOf(schema.properties.number_cards, schema), "x", schema),
    ).toBe("stringArray");
    // The text or list of texts of a phase stays what it was
    expect(
      kindOf(
        {
          oneOf: [
            { type: "string" },
            { type: "array", items: { type: "string" } },
          ],
        },
        "x",
        schema,
      ),
    ).toBe("stringList");
  });

  it("reads an array of strings from a list as a list of choices", () => {
    expect(
      kindOf(
        { type: "array", items: { type: "string", enum: ["a", "b"] } },
        "x",
        schema,
      ),
    ).toBe("enumList");
    expect(
      kindOf(
        { type: "array", items: { type: "number", enum: [1, 2] } },
        "x",
        schema,
      ),
    ).toBe("json");
    const formats = resolveAllOf(schema.properties.exports, schema).properties;
    expect(
      kindOf(resolveAllOf(formats.formats, schema), "formats", schema),
    ).toBe("enumList");
    expect(kindOf(resolveAllOf(formats.docs, schema), "docs", schema)).toBe(
      "enumList",
    );
  });

  it("follows a $ref before it reads the kind", () => {
    const root = { definitions: { v: { type: "boolean" } } };
    expect(kindOf({ $ref: "#/definitions/v" }, "x", root)).toBe("boolean");
    expect(kindOf({ $ref: "#/definitions/none" }, "x", root)).toBe("json");
  });
});

describe("a $ref into another schema file", () => {
  it("follows tiles.defs.json, with the refs inside it", () => {
    const token = resolveSchema(
      { $ref: "tiles.defs.json#/definitions/roundToken", description: "Mine" },
      schema,
    );
    expect(token.type).toBe("object");
    expect(token.description).toBe("Mine");
    expect(token.properties.logo.type).toBe("string");
    // The rounds of the game are a list of those
    const rounds = resolveAllOf(schema.properties.rounds, schema);
    expect(kindOf(rounds, "rounds", schema)).toBe("array");
  });

  it("follows a ref of the other file in that file, not in the root", () => {
    // game.schema.json has no definitions/hex of its own: the one that is
    // found is the one of tiles.defs.json
    expect(schema.definitions.hex).toBeUndefined();
    const hex = resolveSchema(
      { $ref: "tiles.defs.json#/definitions/hex" },
      schema,
    );
    expect(hex.type).toBe("object");
    // Two levels: a property of the hex is a ref in tiles.defs.json, and what
    // that points to has refs of its own
    const nested = Object.values(hex.properties)
      .map((child) => resolveSchema(child, schema))
      .filter((child) => child && !child.$ref);
    expect(nested.length).toBe(Object.keys(hex.properties).length);
  });

  it("follows three files deep in a document that has its own definitions", () => {
    // The name of the same definition in the root and in the document: each
    // ref goes to the document it was written in
    const root = {
      definitions: { token: { type: "boolean" } },
    };
    const token = resolveSchema(
      { $ref: "tiles.defs.json#/definitions/gameToken" },
      root,
    );
    expect(token.type).toBe("object");
    Object.values(token.properties).forEach((child) => {
      const resolved = resolveSchema(child, root);
      expect(resolved.$ref).toBeUndefined();
    });
  });

  it("stops at a ref that goes round in a circle or to nothing", () => {
    const root = {
      definitions: {
        a: { $ref: "#/definitions/b" },
        b: { $ref: "#/definitions/a" },
        self: { $ref: "#/definitions/self" },
      },
    };
    expect(resolveSchema({ $ref: "#/definitions/a" }, root).$ref).toBeDefined();
    expect(resolveSchema({ $ref: "#/definitions/self" }, root)).toEqual({
      $ref: "#/definitions/self",
    });
    expect(kindOf({ $ref: "#/definitions/a" }, "x", root)).toBe("json");
    expect(
      resolveSchema({ $ref: "tiles.defs.json#/definitions/none" }, root).$ref,
    ).toBe("tiles.defs.json#/definitions/none");
  });
});

describe("the schema through a record", () => {
  const root = {
    type: "object",
    properties: {
      colors: {
        type: "object",
        additionalProperties: { $ref: "#/definitions/color" },
      },
      fixed: {
        type: "object",
        properties: { a: { type: "number" } },
        additionalProperties: { type: "string" },
      },
    },
    definitions: { color: { type: "string", description: "A color" } },
  };

  it("finds the schema of the value of any name", () => {
    expect(schemaAt(root, ["colors", "red"]).description).toBe("A color");
    expect(schemaAt(root, ["colors", "__proto__"]).type).toBe("string");
    expect(schemaAt(root, ["colors", "constructor"]).type).toBe("string");
    // A name that looks like an index is still a name
    expect(schemaAt(root, ["colors", "1"]).type).toBe("string");
    expect(schemaAt(root, ["colors", "a.b/c~d"]).type).toBe("string");
    expect(schemaAt(root, ["fixed", "a"]).type).toBe("number");
  });

  it("finds the upgrades and the shares of the real schema", () => {
    expect(schemaAt(schema, ["upgrades", "x"]).type).toBe("array");
    expect(schemaAt(schema, ["shareTypes", "x"]).type).toBe("array");
    expect(schemaAt(schema, ["colors", "x"]).oneOf).toBeDefined();
  });

  it("has no schema for a name of an object that is not a record", () => {
    expect(schemaAt(schema, ["info", "nothing"])).toBeUndefined();
    expect(schemaAt(root, ["fixed", "__proto__"]).type).toBe("string");
  });

  it("the value of a name cannot be unset, the name of a property can", () => {
    expect(isRequired(root, ["colors", "red"])).toBe(true);
    expect(isRequired(root, ["fixed", "a"])).toBe(false);
  });

  it("matches the problem of a name as the validation writes it", () => {
    const issue = { pointer: "colors.a.b", code: "type", params: {} };
    expect(issuesFor([issue], ["colors", "a.b"])).toEqual([issue]);
  });
});

describe("the names of a record", () => {
  it("renames in place, removes and inserts, with any name", () => {
    const record = { a: 1, b: 2, c: 3 };
    expect(Object.entries(renameKey(record, "b", "x"))).toEqual([
      ["a", 1],
      ["x", 2],
      ["c", 3],
    ]);
    expect(Object.keys(removeKey(record, "b"))).toEqual(["a", "c"]);
    expect(Object.keys(insertKey(record, 1, "n", 9))).toEqual([
      "a",
      "n",
      "b",
      "c",
    ]);
    expect(Object.keys(insertKey(record, 99, "n", 9))).toEqual([
      "a",
      "b",
      "c",
      "n",
    ]);
    const odd = renameKey(record, "a", "__proto__");
    expect(Object.keys(odd)).toEqual(["__proto__", "b", "c"]);
    expect(Object.getPrototypeOf(odd)).toBe(Object.prototype);
    expect(odd.__proto__).toBe(1);
  });

  it("finds a free name", () => {
    expect(freeKey({ a: 1 }, "b")).toBe("b");
    expect(freeKey({ a: 1, a2: 1 }, "a")).toBe("a3");
    expect(freeKey({ constructor: 1 }, "constructor")).toBe("constructor2");
  });

  it("starts a new value as the schema asks", () => {
    expect(defaultValue({ type: "string" })).toBe("");
    expect(defaultValue({ type: "number", minimum: 1 })).toBe(1);
    expect(defaultValue({ type: "boolean" })).toBe(false);
    expect(defaultValue({ type: "array" })).toEqual([]);
    expect(defaultValue({ type: "object" })).toEqual({});
    expect(defaultValue({ enum: ["a", "b"] })).toBe("a");
    expect(defaultValue({ default: [1] })).toEqual([1]);
    expect(
      defaultValue({ oneOf: [{ type: "string" }, { type: "object" }] }),
    ).toBe("");
    expect(
      defaultValue(schema.properties.upgrades.additionalProperties),
    ).toEqual([]);
  });

  it("sets and clears a value under any name without touching the prototype", () => {
    const game = { colors: { red: "#f00" } };
    for (const name of ["__proto__", "constructor", "a.b", "a/b", "a~b", "1"]) {
      const next = setValue(game, ["colors", name], "#0f0");
      expect(Object.keys(next.colors).sort()).toEqual(["red", name].sort());
      expect(valueAt(["colors", name], next)).toBe("#0f0");
      expect(Object.getPrototypeOf(next.colors)).toBe(Object.prototype);
      // The next change keeps it
      const again = setValue(next, ["colors", "blue"], "#00f");
      expect(Object.keys(again.colors).sort()).toEqual(
        ["red", name, "blue"].sort(),
      );
      expect(valueAt(["colors", name], again)).toBe("#0f0");
      expect(clearValue(again, ["colors", name]).colors).toEqual({
        red: "#f00",
        blue: "#00f",
      });
    }
    expect(game).toEqual({ colors: { red: "#f00" } });
    expect(valueAt(["colors", "__proto__"], game)).toBeUndefined();
    expect(valueAt(["colors", "constructor"], game)).toBeUndefined();
    expect(clearValue(game, ["colors", "__proto__"])).toBe(game);
  });
});

describe("one text a line, as a list", () => {
  it("is always a list, trimmed, with no blank lines", () => {
    expect(parseLines("a")).toEqual(["a"]);
    expect(parseLines(" a \n\n b\r\n")).toEqual(["a", "b"]);
    expect(parseLines("  \n ")).toBeUndefined();
    expect(parseLines("")).toBeUndefined();
  });

  it("formats a list a line each", () => {
    expect(formatLines(["a", "b"])).toBe("a\nb");
    expect(formatLines(undefined)).toBe("");
  });
});

describe("referenceOf", () => {
  const at = (...keys) => schemaAt(schema, keys);
  const company = { from: "companies", key: "abbrev", label: "name" };
  const train = { from: "trains", key: "name" };

  it("is a string for a plain reference", () => {
    expect(referenceOf(at("privates", 0, "company"), schema)).toEqual({
      ref: company,
      mode: "single",
    });
  });

  it("is a string or a list for a train event, through the nested oneOf", () => {
    for (const key of ["rust", "phased", "obsolete"]) {
      expect(referenceOf(at("trains", 0, key), schema)).toEqual({
        ref: train,
        mode: "either",
      });
    }
    expect(referenceOf(at("phases", 0, "on"), schema)?.mode).toBe("either");
  });

  it("is a list for a list of names, even with objects in it", () => {
    expect(
      referenceOf(at("stock", "market", 0, 0, "companies"), schema),
    ).toEqual({ ref: company, mode: "list" });
  });

  it("is not one for a string without x-ref", () => {
    expect(referenceOf(at("privates", 0, "name"), schema)).toBeUndefined();
    expect(referenceOf(at("trains", 0, "name"), schema)).toBeUndefined();
  });

  it("is not one for a field of another type", () => {
    expect(referenceOf(at("trains", 0, "price"), schema)).toBeUndefined();
    expect(referenceOf(at("phases", 0, "limit"), schema)).toBeUndefined();
    expect(referenceOf(at("phases", 0, "train"), schema)).toBeUndefined();
    expect(referenceOf(undefined, schema)).toBeUndefined();
  });
});

describe("isReferenceValue", () => {
  it("is nothing, a string or a list of strings, as the mode allows", () => {
    expect(isReferenceValue(undefined, "single")).toBe(true);
    expect(isReferenceValue("4", "single")).toBe(true);
    expect(isReferenceValue("4", "either")).toBe(true);
    expect(isReferenceValue(["4", "5"], "either")).toBe(true);
    expect(isReferenceValue(["4"], "list")).toBe(true);
    expect(isReferenceValue("4", "list")).toBe(false);
    expect(isReferenceValue(["4"], "single")).toBe(false);
  });

  it("is not an object, a list with one, or false", () => {
    expect(isReferenceValue({ on: "4", index: 2 }, "either")).toBe(false);
    expect(isReferenceValue(["4", { on: "4", index: 2 }], "either")).toBe(
      false,
    );
    expect(isReferenceValue(false, "list")).toBe(false);
    expect(isReferenceValue(3, "single")).toBe(false);
  });
});

describe("what a reference stores", () => {
  it("reads a string or a list as a list", () => {
    expect(referenceList(undefined)).toEqual([]);
    expect(referenceList("4")).toEqual(["4"]);
    expect(referenceList(["4", "5"])).toEqual(["4", "5"]);
  });

  it("stores nothing for no name, never an empty string or list", () => {
    expect(referenceValue([], "either")).toBeUndefined();
    expect(referenceValue([], "list")).toBeUndefined();
  });

  it("stores a string for one name only where the schema allows it", () => {
    expect(referenceValue(["4"], "either")).toBe("4");
    expect(referenceValue(["4"], "list")).toEqual(["4"]);
    expect(referenceValue(["4", "5"], "either")).toEqual(["4", "5"]);
  });
});

describe("the rounds tab", () => {
  it("gives the fields of the rounds, turns, pools and number cards a real form, but the shapes", () => {
    const unexpected = [];
    const walk = (node, keys) => {
      const resolved = resolveSchema(node, schema);
      const kind = kindOf(resolved, keys[keys.length - 1], schema);
      if (kind === "json") unexpected.push(keys.join("."));
      if (kind === "array") {
        walk(resolveSchema(resolved.items, schema), [...keys, "0"]);
      }
      if (kind === "object") {
        Object.entries(resolved.properties).forEach(([key, child]) =>
          walk(child, [...keys, key]),
        );
      }
    };
    ROUND_KEYS.forEach((key) => walk(schema.properties[key], [key]));
    // The shapes of a round token are JSON, as on a train or a tile
    expect(unexpected).toEqual([
      "rounds.0.bar",
      "rounds.0.circle",
      "rounds.0.shield",
      "rounds.0.shield3",
      "rounds.0.kiteshield",
      "rounds.0.star5",
    ]);
  });
});

describe("the tokens tab", () => {
  it("gives the tokens, token types and share types a real form", () => {
    const unexpected = [];
    const walk = (node, keys) => {
      const resolved = resolveSchema(node, schema);
      const kind = kindOf(resolved, keys[keys.length - 1], schema);
      if (kind === "json") unexpected.push(keys.join("."));
      if (kind === "record") {
        walk(resolved.additionalProperties, [...keys, "name"]);
      }
      if (kind === "array") {
        walk(mixedItem(resolved.items, schema) ?? resolved.items, [
          ...keys,
          "0",
        ]);
      }
      if (kind === "object") {
        Object.entries(resolved.properties).forEach(([key, child]) =>
          walk(child, [...keys, key]),
        );
      }
    };
    TOKEN_KEYS.forEach((key) => walk(schema.properties[key], [key]));
    // The shapes of a token are JSON, as on a train or a tile
    expect(unexpected.every((path) => path.startsWith("tokens.0."))).toBe(true);
  });

  it("knows list items of text, a number or an object, but not a reference", () => {
    const tokens = resolveSchema(schema.properties.tokens, schema);
    expect(kindOf(tokens, "tokens", schema)).toBe("array");
    expect(mixedItem(tokens.items, schema).properties.label).toBeDefined();
    expect(mixedItem({ type: "string" }, schema)).toBeUndefined();
    expect(
      mixedItem(
        {
          oneOf: [
            { type: "string", "x-ref": { from: "x" } },
            { type: "object", properties: {} },
          ],
        },
        schema,
      ),
    ).toBeUndefined();
  });
});
