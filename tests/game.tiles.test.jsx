import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("game tiles", () => {
  it.for(["die", "smallDie", "individual", "offset"])(
    "can load and display %s tiles",
    async (layout) => {
      renderApp(`/games/18Test/tiles?config.tiles.layout=${layout}`);
      expect(
        await screen.findByTestId("game-18Test-tiles"),
      ).toBeInTheDocument();
    },
  );
});
