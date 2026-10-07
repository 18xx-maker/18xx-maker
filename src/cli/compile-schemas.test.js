import fs from "node:fs";
import path from "node:path";

import compile, {
  LANGUAGES,
  PUBLISHED,
  localizeSchemaFile,
} from "#cli/compile-schemas";
import { SCHEMA_KEY, schemaKeys } from "../util/schemaKeys.js";

// Never overwrite the real generated schema
vi.mock("node:fs", async (importOriginal) => {
  const real = await importOriginal();
  const mocked = { ...real.default, writeFileSync: vi.fn() };
  return { ...mocked, default: mocked };
});

const schemas = path.join(import.meta.dirname, "../schemas");
const readSchema = (name) =>
  JSON.parse(fs.readFileSync(path.join(schemas, name), "utf-8"));

describe("compile-schemas", () => {
  let calls;
  let file;
  let written;

  beforeAll(async () => {
    compile();
    // Prettier formats asynchronously
    await vi.waitFor(() => {
      if (fs.writeFileSync.mock.calls.length === 0) {
        throw new Error("tiles.defs.json not written yet");
      }
    });
    calls = fs.writeFileSync.mock.calls.length;
    [file, written] = fs.writeFileSync.mock.calls[0];
  });

  it("writes tiles.defs.json once, next to the other schemas", () => {
    expect(calls).toBe(1);
    expect(file).toBe(path.join(schemas, "tiles.defs.json"));
  });

  it("writes prettier formatted json", () => {
    expect(written).toMatch(/^\{\n {2}"/);
    expect(written.endsWith("\n")).toBe(true);
  });

  it("adds the shared field properties to each tile element", () => {
    const fields = readSchema("fields.schema.json").definitions;
    const defs = JSON.parse(written).definitions;

    expect(defs.cities.items.properties).toMatchObject({
      ...fields.position.properties,
      ...fields.revenue.properties,
    });
    expect(defs.goods.items.properties).toMatchObject({
      ...fields.text.properties,
      ...fields.svg.properties,
      ...fields.font.properties,
      ...fields.position.properties,
    });
    expect(defs.name.properties).toMatchObject(fields.font.properties);
  });

  it("keeps the source tile definitions", () => {
    const src = readSchema("tiles.src.json");
    const defs = JSON.parse(written);
    expect(defs.$id).toBe(src.$id);
    expect(Object.keys(defs.definitions)).toEqual([
      ...Object.keys(src.definitions),
      "gameToken",
      "roundToken",
    ]);
  });

  it("derives the game and round tokens from the token", () => {
    const { token, gameToken, roundToken } = JSON.parse(written).definitions;
    const extra = (derived) =>
      Object.keys(derived.properties).filter((key) => !token.properties[key]);

    expect(extra(gameToken)).toEqual(["quantity", "print"]);
    expect(extra(roundToken)).toEqual(["name", "small"]);
    expect(roundToken.required).toEqual(["name"]);
    expect(gameToken.additionalProperties).toBe(false);
    expect(roundToken.additionalProperties).toBe(false);
  });

  it("matches the committed tiles.defs.json", () => {
    expect(JSON.parse(written)).toEqual(readSchema("tiles.defs.json"));
  });
});

const read = (file) => fs.readFileSync(file, "utf-8");
const locales = path.join(import.meta.dirname, "../locales");
const published = path.join(import.meta.dirname, "../../public/schemas");
const strings = Object.fromEntries(
  LANGUAGES.map((language) => [
    language,
    JSON.parse(read(path.join(locales, `schema.${language}.json`))),
  ]),
);
const folder = (language) =>
  language === "en" ? published : path.join(published, language);

// Every description of a schema, wherever the schema keeps one
const descriptions = (node, found = []) => {
  if (Array.isArray(node)) node.forEach((part) => descriptions(part, found));
  else if (node && typeof node === "object") {
    for (const [name, value] of Object.entries(node)) {
      if (["default", "examples", "const", "enum"].includes(name)) continue;
      if (name === "description" && typeof value === "string") {
        found.push(value);
      } else {
        descriptions(value, found);
      }
    }
  }
  return found;
};

describe("the text of the source schemas", () => {
  const sources = [
    "companies.schema.json",
    "config.schema.json",
    "fields.schema.json",
    "game.schema.json",
    "publishers.schema.json",
    "theme.schema.json",
    "tiles.schema.json",
    "tiles.src.json",
    "tiles.defs.json",
  ];

  it.each(sources)("%s has only keys of schema.en.json", (file) => {
    const schema = readSchema(file);
    expect(
      descriptions(schema).filter((text) => !SCHEMA_KEY.test(text)),
    ).toEqual([]);
    expect(schemaKeys(schema).filter((key) => !(key in strings.en))).toEqual(
      [],
    );
  });
});

describe.each(LANGUAGES)("the schemas in %s", (language) => {
  it.each(PUBLISHED)("compiles %s to the committed file", async (file) => {
    const compiled = await localizeSchemaFile(
      read(path.join(schemas, file)),
      strings[language],
      language,
      file === "tiles.defs.json",
    );
    expect(compiled).toBe(read(path.join(folder(language), file)));
  });

  it.each(PUBLISHED)("%s has no key left", (file) => {
    const schema = JSON.parse(read(path.join(folder(language), file)));
    expect(schemaKeys(schema)).toEqual([]);
  });

  it("points the game schema at the tile definitions of the language", () => {
    const text = read(path.join(folder(language), "game.schema.json"));
    const game = JSON.parse(text);
    const defs = JSON.parse(
      read(path.join(folder(language), "tiles.defs.json")),
    );
    const ref = text.match(
      /"\$ref": "(tiles\.defs\.json)#\/definitions\/hex"/,
    )[1];
    expect(game.$id).toBe(
      `https://18xx-maker.com/schemas/${language === "en" ? "" : `${language}/`}game.schema.json`,
    );
    expect(new URL(ref, game.$id).href).toBe(defs.$id);
  });
});

describe("localizeSchemaFile", () => {
  it("fails on a key without text", async () => {
    const raw = '{ "description": "schema.game.nope" }';
    await expect(localizeSchemaFile(raw, {}, "en", false)).rejects.toThrow(
      "Unknown schema key schema.game.nope",
    );
  });

  it("keeps the layout of the source", async () => {
    const raw = '{\n  "a": { "description": "schema.x" }\n}\n';
    expect(
      await localizeSchemaFile(raw, { "schema.x": "Text" }, "en", false),
    ).toBe('{\n  "a": { "description": "Text" }\n}\n');
  });
});
