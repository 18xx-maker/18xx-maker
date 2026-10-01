import { describe, expect, it } from "vitest";

import { findGame, parts } from "@tests/smoke.js";
import { printMarkup } from "@tests/snapshot.js";

// Games whose print output is locked down:
// 18Test every feature, 1889 classic, 1867 market ledges and many charters,
// 1858 large map
const slugs = ["18Test", "1889", "1867", "1858"];

// The print pages, not the info page or the paginated screen variants
const pages = parts.filter(
  ({ id }) => id !== "info" && !id.includes("?paginated"),
);

describe.each(slugs)("%s snapshots", (slug) => {
  const game = findGame(slug);

  pages
    .filter((entry) => entry.has(game))
    .forEach((entry) => {
      it(`${entry.id} output is unchanged`, async () => {
        const html = await printMarkup(slug, entry.path(game), entry.suffix);
        await expect(html).toMatchFileSnapshot(
          `./__snapshots__/${slug}/${entry.id}.html`,
        );
      });
    });
});
