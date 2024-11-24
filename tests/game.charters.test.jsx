import { screen } from "@testing-library/react";

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
});
