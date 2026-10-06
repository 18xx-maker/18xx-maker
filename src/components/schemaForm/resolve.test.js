import schema from "@/schemas/game.schema.json";
import {
  COMPANY_PRIMARY_KEYS,
  GAME_INFO_KEYS,
  PHASE_PRIMARY_KEYS,
  clearValue,
  coerceStringOrNumber,
  formatList,
  formatRevenue,
  humanize,
  insertAt,
  isRequired,
  issuesFor,
  kindOf,
  moveItem,
  newItem,
  nextAbbrev,
  nextName,
  parseLimit,
  parseList,
  parseRevenue,
  removeAt,
  resolveAllOf,
  resolveSchema,
  sameList,
  schemaAt,
  setValue,
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
      "trains.0.discount": "json",
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
    expect(json).toEqual(["discount", "rust", "phased", "obsolete"]);
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
          kindOf(resolveAllOf(node, schema), key, schema) === "json",
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
          kindOf(resolveAllOf(node, schema), key, schema) === "json",
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
