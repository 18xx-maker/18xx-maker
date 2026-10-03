import { screen } from "@testing-library/react";

import { one } from "@tests/coverage.render.jsx";
import { renderApp } from "@tests/helpers.jsx";

describe("game charters", () => {
  it.for(["free", "3x1"])(
    "can load and display %s charters",
    async (layout) => {
      renderApp(`/games/18Test/charters?config.charters.layout=${layout}`);
      expect(
        await screen.findByTestId("game-18Test-charters"),
      ).toBeInTheDocument();
    },
  );

  // Half width charters have no room for trains, the cards print them instead
  it.for([
    ["3x1", false],
    ["3x2", true],
  ])(
    "draws the single charter of %s with halfWidth %s",
    async ([layout, half]) => {
      renderApp(`/games/18Test/charters/0?config.charters.layout=${layout}`);
      const root = await screen.findByTestId("game-18Test-charter");
      expect(one(root, ".charter--half") !== null).toBe(half);
      expect(one(root, ".charter__traincards") !== null).toBe(!half);
    },
  );
});
