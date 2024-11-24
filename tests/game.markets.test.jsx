import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("game markets", () => {
  it.for(["18SJ", "18TraXX2020", "1867"])(
    "%s can display it's market",
    async (game) => {
      renderApp(`/games/${game}/market`);

      expect(
        await screen.findByTestId(`game-${game}-market`),
      ).toBeInTheDocument();
    },
  );
});
