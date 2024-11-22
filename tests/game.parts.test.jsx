import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("game pages", () => {
  it.for([
    "",
    "background",
    "cards",
    "charters",
    "map",
    "map?paginated=true",
    "market",
    "market?paginated=true",
    "par",
    "par?paginated=true",
    "revenue",
    "revenue?paginated=true",
    "tile-manifest",
    "tiles",
    "tokens",
  ])("%s can load and display", async (page) => {
    renderApp(`/games/18Test/${page}`);
    expect(
      await screen.findByRole("link", { name: /by Christopher Giroir/i }),
    ).toBeInTheDocument();
  });
});
