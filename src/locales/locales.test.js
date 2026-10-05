import de from "./de.json";
import en from "./en.json";
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
