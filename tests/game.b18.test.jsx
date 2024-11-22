import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("game pages", () => {
  it.for(["map", "tiles/yellow", "tiles/green", "tiles/brown", "tokens"])(
    "%s can load and display b18 elements",
    async (page) => {
      renderApp(`/games/18Test/b18/${page}`);
      expect(
        await screen.findByRole("link", { name: /by Christopher Giroir/i }),
      ).toBeInTheDocument();
    },
  );
});
