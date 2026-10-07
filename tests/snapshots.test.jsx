import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { findGame, parts } from "@tests/support/smoke.js";
import { printMarkup } from "@tests/support/snapshot.js";

// Games whose print output is locked down:
// 18Test every feature, 1889 classic, 1867 market ledges and many charters,
// 1858 large map
const slugs = ["18Test", "1889", "1867", "1858"];

// The print pages, not the info page or the paginated screen variants
const pages = parts.filter(
  ({ id }) => id !== "info" && !id.includes("?paginated"),
);

// Text measurements depend on the installed fonts, so use a fixed size
beforeAll(() => {
  vi.spyOn(SVGGraphicsElement.prototype, "getBBox").mockReturnValue({
    height: 22,
    width: 110,
    x: 0,
    y: 0,
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Every snapshot file the tests below generate, relative to the snapshot
// directory. The obsolete check compares this to the files on disk.
const expected = [];

describe.each(slugs)("%s snapshots", (slug) => {
  const game = findGame(slug);

  pages
    .filter((entry) => entry.has(game))
    .forEach((entry) => {
      expected.push(`${slug}/${entry.id}.html`);

      it(`${entry.id} output is unchanged`, async () => {
        const html = await printMarkup(slug, entry.path(game), entry.suffix);
        await expect(html).toMatchFileSnapshot(
          `./__snapshots__/${slug}/${entry.id}.html`,
        );
      });
    });
});

// The cards with the backs of the trains, which only the free layout and the
// duplex config print: front pages followed by their mirrored back pages
describe("18Test duplex cards", () => {
  expected.push("18Test/cards-duplex.html");

  it("output is unchanged", async () => {
    const html = await printMarkup(
      "18Test",
      "cards?print=true&config.cards.layout=free&config.cards.duplex=long",
      "-cards",
    );
    await expect(html).toMatchFileSnapshot(
      "./__snapshots__/18Test/cards-duplex.html",
    );
  });
});

// vitest never reports snapshot files that no test writes anymore (a removed
// game or page), so check for them here
describe("snapshot files", () => {
  it("has no obsolete files", () => {
    const files = import.meta.glob("./__snapshots__/**/*", {
      eager: true,
      query: "?raw",
    });
    const actual = Object.keys(files).map((file) =>
      file.replace("./__snapshots__/", ""),
    );

    // The diff lists the extra files
    expect(actual.sort()).toEqual([...expected].sort());
  });
});
