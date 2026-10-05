// A game with one of each kind of mistake the problems page reports: a typo
// of a field, a value of the wrong type, a value that is not allowed, a
// missing required field and a deprecated field.
export const brokenGame = () => ({
  info: { title: "Broken", subtitle: "s", designer: "d", publisher: "p" },
  meta: { id: "Broken", type: "bundled", slug: "Broken" },
  stock: { marekt: 10 },
  exports: { paginated: true, png: { dpi: "300" }, layouts: "some" },
  companies: [{ name: "No abbrev" }],
});

export const validGame = () => ({
  info: { title: "Valid", subtitle: "s", designer: "d", publisher: "p" },
  meta: { id: "Valid", type: "bundled", slug: "Valid" },
});
