import { readFileSync } from "node:fs";

import { slugify } from "@/util/headingIds";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const locales = ["en", "de", "zh"];
const positioning = (lang) =>
  JSON.parse(read(`../locales/${lang}.json`)).elements.positioning;
const doc = (lang) => read(`./games/positioning.${lang}.md`);

const headings = (markdown) =>
  [...markdown.matchAll(/^#{1,6} (.+)$/gm)].map((m) => slugify(m[1]));

describe.each(locales)("positioning doc (%s)", (lang) => {
  const groups = Object.keys(positioning("en").groups);

  it("links the live page only to groups of the page", () => {
    const links = [
      ...doc(lang).matchAll(/\(\/elements\/positioning#([^)]+)\)/g),
    ];

    expect(links.length).toBeGreaterThan(0);
    links.forEach(([, id]) => expect(groups).toContain(id));
  });

  it("has a heading for the anchor of every group of the page", () => {
    const { docAnchors } = positioning(lang);
    const slugs = headings(doc(lang));

    expect(Object.keys(docAnchors)).toEqual(groups);
    Object.values(docAnchors).forEach((anchor) =>
      expect(slugs).toContain(anchor),
    );
  });

  it("links only to headings of the doc", () => {
    const slugs = headings(doc(lang));
    const links = [...doc(lang).matchAll(/\]\(#([^)]+)\)/g)];

    expect(links.length).toBeGreaterThan(0);
    links.forEach(([, anchor]) => expect(slugs).toContain(anchor));
  });
});

describe("links to the positioning doc", () => {
  it.each(locales)("the borders doc in %s names a heading", (lang) => {
    const [, anchor] = read(`./games/borders.${lang}.md`).match(
      /\(\/docs\/games\/positioning#([^)]+)\)/,
    );

    expect(headings(doc(lang))).toContain(anchor);
  });
});
