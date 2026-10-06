import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { slugify } from "@/util/headingIds";

const root = new URL(".", import.meta.url).pathname;
const locales = ["en", "de", "zh"];

const files = (dir = "") =>
  readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(dir, entry.name))
      : /\.(en|de|zh)\.md$/.test(entry.name)
        ? [join(dir, entry.name)]
        : [],
  );

// A page is the path without the language and extension: "games/tiles"
const pages = [
  ...new Set(files().map((f) => f.replace(/\.(en|de|zh)\.md$/, ""))),
];
const read = (page, lang) =>
  readFileSync(join(root, `${page}.${lang}.md`), "utf8");

const withoutCode = (markdown) => markdown.replace(/^```[\s\S]*?^```/gm, "");

// Headings are numbered like rehypeHeadingIds does when a page repeats one
const anchors = (markdown) => {
  const seen = {};
  return [...withoutCode(markdown).matchAll(/^#{1,6} (.+)$/gm)].map((m) => {
    const base = slugify(m[1]) || "section";
    const count = seen[base] || 0;
    seen[base] = count + 1;
    return count ? `${base}-${count}` : base;
  });
};

const links = (markdown) =>
  [...withoutCode(markdown).matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map(
    (m) => m[1],
  );

describe.each(locales)("docs links (%s)", (lang) => {
  it.each(pages)("%s links to existing pages and headings", (page) => {
    const broken = [];
    for (const link of links(read(page, lang))) {
      let target;
      let hash;
      if (link.startsWith("#")) {
        target = page;
        hash = link.slice(1);
      } else {
        const match = link.match(
          /^\/docs(?:\/([^#?]*))?(?:\?[^#]*)?(?:#(.*))?$/,
        );
        if (!match) continue;
        target = (match[1] || "index").replace(/\/$/, "");
        hash = match[2];
      }

      const exists = existsSync(join(root, `${target}.${lang}.md`));
      broken.push(...(exists ? [] : [link]));
      if (exists && hash) {
        const id = decodeURIComponent(hash);
        broken.push(
          ...(anchors(read(target, lang)).includes(id) ? [] : [link]),
        );
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("docs translations", () => {
  it.each(pages)("%s has the same headings in every language", (page) => {
    const counts = locales.map((lang) => anchors(read(page, lang)).length);
    expect(counts[1]).toBe(counts[0]);
    expect(counts[2]).toBe(counts[0]);
  });
});
