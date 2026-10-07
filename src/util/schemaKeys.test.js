import {
  SCHEMA_KEY,
  localizeSchema,
  resolveSchemaKeys,
  schemaKeys,
} from "@/util/schemaKeys";

const schema = {
  type: "object",
  description: "schema.test.root",
  properties: {
    name: { type: "string", description: "schema.test.name" },
    // A property that is called description is not a description
    description: { type: "string", description: "schema.test.description" },
    old: {
      type: "boolean",
      deprecated: true,
      description: "schema.test.old",
      deprecationMessage: "schema.test.old.deprecated",
    },
    plain: { type: "string", description: "Plain text stays" },
    data: {
      default: { description: "schema.test.default" },
      enum: ["description"],
    },
  },
  oneOf: [{ description: "schema.test.name" }],
};

const strings = {
  "schema.test.root": "The root",
  "schema.test.name": "A name",
  "schema.test.description": "A description",
  "schema.test.old": "Old",
  "schema.test.old.deprecated": "Do not use",
};

describe("SCHEMA_KEY", () => {
  it("matches keys and no text", () => {
    expect(SCHEMA_KEY.test("schema.game.exports.layouts")).toBe(true);
    expect(SCHEMA_KEY.test("schema.tiles.gameToken")).toBe(true);
    expect(SCHEMA_KEY.test("The schema.")).toBe(false);
    expect(SCHEMA_KEY.test("schema. nope")).toBe(false);
    expect(SCHEMA_KEY.test("How many of this token to print.")).toBe(false);
  });
});

describe("resolveSchemaKeys", () => {
  it("puts the text where the keys are, in the same order", () => {
    const resolved = resolveSchemaKeys(schema, strings);
    expect(resolved.description).toBe("The root");
    expect(resolved.properties.name.description).toBe("A name");
    expect(resolved.properties.description.description).toBe("A description");
    expect(resolved.properties.old.deprecationMessage).toBe("Do not use");
    expect(resolved.oneOf[0].description).toBe("A name");
    expect(Object.keys(resolved.properties.old)).toEqual(
      Object.keys(schema.properties.old),
    );
  });

  it("leaves plain text and data alone", () => {
    const resolved = resolveSchemaKeys(schema, strings);
    expect(resolved.properties.plain.description).toBe("Plain text stays");
    expect(resolved.properties.data).toEqual(schema.properties.data);
  });

  it("does not change the schema", () => {
    const before = JSON.stringify(schema);
    resolveSchemaKeys(schema, strings);
    expect(JSON.stringify(schema)).toBe(before);
  });

  it("throws on a key without text", () => {
    const rest = { ...strings };
    delete rest["schema.test.name"];
    expect(() => resolveSchemaKeys(schema, rest)).toThrow(
      "Unknown schema key schema.test.name",
    );
  });
});

describe("localizeSchema", () => {
  it("uses the text of t", () => {
    const localized = localizeSchema(schema, (key) => strings[key]);
    expect(localized.properties.name.description).toBe("A name");
    expect(localized.properties.old.deprecationMessage).toBe("Do not use");
  });

  it("keeps a key that t has no text for", () => {
    const localized = localizeSchema(schema, () => undefined);
    expect(localized).toEqual(schema);
  });
});

describe("schemaKeys", () => {
  it("lists every key once", () => {
    expect(schemaKeys(schema)).toEqual([
      "schema.test.root",
      "schema.test.name",
      "schema.test.description",
      "schema.test.old",
      "schema.test.old.deprecated",
    ]);
  });
});
