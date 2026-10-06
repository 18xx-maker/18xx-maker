import schema from "@/schemas/game.schema.json";
import {
  GAME_INFO_KEYS,
  clearValue,
  coerceStringOrNumber,
  formatRevenue,
  humanize,
  insertAt,
  isRequired,
  issuesFor,
  kindOf,
  moveItem,
  newItem,
  nextName,
  parseRevenue,
  removeAt,
  resolveAllOf,
  resolveSchema,
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
    [{ type: "string" }, "description", "text"],
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
        kindOf(resolveAllOf(node, schema), key, schema),
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
        kindOf(resolveAllOf(node, schema), key, schema),
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
  });

  it("makes an item with the defaults of its list and a free name", () => {
    expect(newItem([])).toEqual({ name: "1" });
    expect(newItem([{ name: "1" }], { color: "gray", quantity: 1 })).toEqual({
      name: "2",
      color: "gray",
      quantity: 1,
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
