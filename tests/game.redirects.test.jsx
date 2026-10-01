import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";
import { groups, lackingGame } from "@tests/smoke.js";

// A game without the data for a page redirects to the game's info page. Pages
// that every bundled game has data for (e.g. tiles) have nothing to test.
describe.each(Object.keys(groups))("%s page redirects", (group) => {
  groups[group]
    .filter((entry) => entry.redirects && lackingGame(entry))
    .forEach((entry) => {
      it(`${entry.id} redirects to info when the game lacks the data`, async () => {
        const game = lackingGame(entry);
        const slug = game.meta.slug;
        renderApp(`/games/${slug}/${entry.path(game)}`);
        expect(await screen.findByTestId(`game-${slug}`)).toBeInTheDocument();
      });
    });
});
