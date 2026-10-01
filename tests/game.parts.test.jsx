import { screen } from "@testing-library/react";

import games from "@/data/games";

import { duplicateHexGames, gameSlugs, renderApp } from "@tests/helpers.jsx";

// Each page: [path, testid suffix, whether the game has data for the page].
// Pages whose game lacks the data redirect to the game's info page.
const pages = [
  ["", "", () => true],
  ["background", "-background", () => true],
  ["cards", "-cards", () => true],
  ["charters", "-charters", (g) => !!g.companies],
  ["map", "-map", (g) => !!g.map],
  ["map?paginated=true", "-map-paginated", (g) => !!g.map],
  ["market", "-market", (g) => !!g.stock?.market],
  ["market?paginated=true", "-market-paginated", (g) => !!g.stock?.market],
  ["par", "-par", (g) => !!g.stock?.par?.values],
  ["par?paginated=true", "-par-paginated", (g) => !!g.stock?.par?.values],
  ["revenue", "-revenue", () => true],
  ["revenue?paginated=true", "-revenue-paginated", () => true],
  ["tile-manifest", "-tile-manifest", (g) => !!g.tiles],
  ["tiles", "-tiles", (g) => !!g.tiles],
  ["tokens", "-tokens", (g) => !!g.companies || !!g.tokens],
];

// Known real bugs that log React warnings (duplicate keys). The pages still
// render, so these are marked as expected failures until the data is fixed.
// TODO: map hexes with duplicate coordinates in the game data (the same hex
// is defined twice) in 1871BC (F10), 18NC (C14) and 18TraXX2020 (D26).
// TODO: 18EB defines two trains with the same name ("5"), so the charters
// phase table renders duplicate <li> keys.
const knownWarnings = {
  ...Object.fromEntries(
    duplicateHexGames.map((slug) => [slug, ["map", "map?paginated=true"]]),
  ),
  "18EB": ["charters"],
};

describe.each(gameSlugs)("%s pages", (slug) => {
  const game = Object.values(games).find((g) => g.meta.slug === slug);

  pages.forEach(([page, suffix, has]) => {
    const test = knownWarnings[slug]?.includes(page) ? it.fails : it;

    test(`${page} can load and display`, async () => {
      renderApp(`/games/${slug}/${page}`);
      const testId = has(game) ? `game-${slug}${suffix}` : `game-${slug}`;
      expect(await screen.findByTestId(testId)).toBeInTheDocument();
    });
  });
});
