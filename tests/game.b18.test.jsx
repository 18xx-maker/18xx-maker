import { screen } from "@testing-library/react";

import games from "@/data/games";

import { duplicateHexGames, gameSlugs, renderApp } from "@tests/helpers.jsx";

describe.each(gameSlugs)("%s b18 pages", (slug) => {
  const game = Object.values(games).find((g) => g.meta.slug === slug);

  // Games without the data redirect to the game's info page (the b18 map
  // does not, so it is only tested for games with a map)
  const pages = [
    ["map", "map", !!game.map],
    ["tiles/yellow", "tiles", !!game.tiles],
    ["tiles/green", "tiles", !!game.tiles],
    ["tiles/brown", "tiles", !!game.tiles],
    ["tokens", "tokens", true],
  ];

  pages
    .filter(([, , has]) => has)
    .forEach(([page, kind]) => {
      // TODO: these games define the same hex twice, which logs a React
      // duplicate key warning (see game.parts.test.jsx)
      const test =
        kind === "map" && duplicateHexGames.includes(slug) ? it.fails : it;

      test(`${page} can load and display b18 elements`, async () => {
        renderApp(`/games/${slug}/b18/${page}`);
        expect(
          await screen.findByTestId(`game-${slug}-b18-${kind}`),
        ).toBeInTheDocument();
      });
    });
});
