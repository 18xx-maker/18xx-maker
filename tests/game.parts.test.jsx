import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("game pages", () => {
  it.for([
    ["", "game-18Test"],
    ["background", "game-18Test-background"],
    ["cards", "game-18Test-cards"],
    ["charters", "game-18Test-charters"],
    ["map", "game-18Test-map"],
    ["map?paginated=true", "game-18Test-map-paginated"],
    ["market", "game-18Test-market"],
    ["market?paginated=true", "game-18Test-market-paginated"],
    ["par", "game-18Test-par"],
    ["par?paginated=true", "game-18Test-par-paginated"],
    ["revenue", "game-18Test-revenue"],
    ["revenue?paginated=true", "game-18Test-revenue-paginated"],
    ["tile-manifest", "game-18Test-tile-manifest"],
    ["tiles", "game-18Test-tiles"],
    ["tokens", "game-18Test-tokens"],
  ])("%s can load and display", async ([page, id]) => {
    renderApp(`/games/18Test/${page}`);
    expect(await screen.findByTestId(id)).toBeInTheDocument();
  });
});
