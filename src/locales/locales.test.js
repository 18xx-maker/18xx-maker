import companies from "@/schemas/companies.schema.json";
import config from "@/schemas/config.schema.json";
import fields from "@/schemas/fields.schema.json";
import game from "@/schemas/game.schema.json";
import publishers from "@/schemas/publishers.schema.json";
import theme from "@/schemas/theme.schema.json";
import tilesDefs from "@/schemas/tiles.defs.json";
import tiles from "@/schemas/tiles.schema.json";
import tilesSrc from "@/schemas/tiles.src.json";
import { schemaKeys } from "@/util/schemaKeys";
import de from "./de.json";
import en from "./en.json";
import schemaDe from "./schema.de.json";
import schemaEn from "./schema.en.json";
import schemaZh from "./schema.zh.json";
import zh from "./zh.json";

const flatten = (object, prefix = "") =>
  Object.entries(object).flatMap(([key, value]) =>
    typeof value === "object"
      ? flatten(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value]],
  );

const placeholders = (text) =>
  [...text.matchAll(/{{\w+}}|<\/?\w+>/g)].map((m) => m[0]).sort();

describe.each([
  ["de", de],
  ["zh", zh],
])("%s locale", (_, locale) => {
  const source = Object.fromEntries(flatten(en));
  const translated = Object.fromEntries(flatten(locale));

  it("has the same keys as en", () => {
    expect(Object.keys(translated)).toEqual(Object.keys(source));
  });

  it("keeps interpolations and tags", () => {
    const found = Object.keys(source).map((key) => [
      key,
      placeholders(translated[key]),
    ]);
    const wanted = Object.keys(source).map((key) => [
      key,
      placeholders(source[key]),
    ]);
    expect(found).toEqual(wanted);
  });
});

// The text of the schemas: flat files of key to text, the keys of English are
// the ones the schemas use
describe.each([
  ["de", schemaDe],
  ["zh", schemaZh],
])("schema %s locale", (_, locale) => {
  it("has the same keys as en", () => {
    expect(Object.keys(locale)).toEqual(Object.keys(schemaEn));
  });

  it("keeps interpolations and tags", () => {
    const found = Object.keys(schemaEn).map((key) => placeholders(locale[key]));
    const wanted = Object.keys(schemaEn).map((key) =>
      placeholders(schemaEn[key]),
    );
    expect(found).toEqual(wanted);
  });
});

describe.each([
  ["en", schemaEn],
  ["de", schemaDe],
  ["zh", schemaZh],
])("schema %s text", (_, locale) => {
  it("has no empty text", () => {
    expect(
      Object.entries(locale)
        .filter(([, text]) => typeof text !== "string" || text.trim() === "")
        .map(([key]) => key),
    ).toEqual([]);
  });
});

describe("the keys of the schemas", () => {
  it("are all used by a schema", () => {
    const used = new Set(
      [
        companies,
        config,
        fields,
        game,
        publishers,
        theme,
        tiles,
        tilesSrc,
        tilesDefs,
      ].flatMap(schemaKeys),
    );
    expect(Object.keys(schemaEn).filter((key) => !used.has(key))).toEqual([]);
  });
});

describe("translated docs", () => {
  const docs = import.meta.glob(["../docs/**/*.md", "../home/*.md"], {
    eager: true,
    import: "default",
    query: "?raw",
  });

  it.each(["de", "zh"])("has every English page in %s", (language) => {
    const missing = Object.keys(docs)
      .filter((file) => file.endsWith(".en.md"))
      .map((file) => file.replace(".en.md", `.${language}.md`))
      .filter((file) => !(file in docs));
    expect(missing).toEqual([]);
  });
});
