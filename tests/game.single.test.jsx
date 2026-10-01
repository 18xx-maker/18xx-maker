import { screen } from "@testing-library/react";

import games from "@/data/games";
import { compileCompanies } from "@/util/companies";

import { gameSlugs, renderApp } from "@tests/helpers.jsx";

describe.each(gameSlugs)("%s single pages", (slug) => {
  const game = Object.values(games).find((g) => g.meta.slug === slug);

  // The card page throws for a card that does not exist, so only test the
  // card types a game actually has (index 0 is the first card of each type)
  const cardTypes = {
    private: game.privates?.length > 0,
    share: compileCompanies(game).some((c) => c.shares?.length > 0),
    train: game.trains?.length > 0,
    number: true,
  };

  it.for(Object.keys(cardTypes).filter((type) => cardTypes[type]))(
    "can load and display a %s card",
    async (type) => {
      renderApp(`/games/${slug}/cards/${type}/0`);
      expect(
        await screen.findByTestId(`game-${slug}-card`),
      ).toBeInTheDocument();
    },
  );

  // Games without the data redirect to the game's info page
  it("can load and display a charter", async () => {
    renderApp(`/games/${slug}/charters/0`);
    expect(
      await screen.findByTestId(
        game.companies ? `game-${slug}-charter` : `game-${slug}`,
      ),
    ).toBeInTheDocument();
  });

  it("can load and display a tile", async () => {
    const id = game.tiles ? Object.keys(game.tiles)[0] : "1";
    renderApp(`/games/${slug}/tiles/${encodeURIComponent(id)}`);
    expect(
      await screen.findByTestId(
        game.tiles ? `game-${slug}-tile` : `game-${slug}`,
      ),
    ).toBeInTheDocument();
  });

  it("can load and display a token", async () => {
    renderApp(`/games/${slug}/tokens/0`);
    expect(await screen.findByTestId(`game-${slug}-token`)).toBeInTheDocument();
  });
});
