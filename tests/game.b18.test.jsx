import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("game pages", () => {
  it.for([
    ["map", "map"],
    ["tiles/yellow", "tiles"],
    ["tiles/green", "tiles"],
    ["tiles/brown", "tiles"],
    ["tokens", "tokens"],
  ])("%s can load and display b18 elements", async ([page, kind]) => {
    renderApp(`/games/18Test/b18/${page}`);
    expect(
      await screen.findByTestId(`game-18Test-b18-${kind}`),
    ).toBeInTheDocument();
  });
});
