import schema from "@/schemas/game.schema.json";
import {
  GAME_INFO_KEYS,
  clearValue,
  coerceStringOrNumber,
  humanize,
  isRequired,
  issuesFor,
  kindOf,
  resolveSchema,
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
