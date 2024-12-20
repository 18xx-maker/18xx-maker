import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("game single pages", () => {
  it.for(["private", "share", "train", "number"])(
    "can load and display a %s card",
    async (type) => {
      renderApp(`/games/18Test/cards/${type}/1`);
      expect(await screen.findByTestId("game-18Test-card")).toBeInTheDocument();
    },
  );

  it("can load and display a charter", async () => {
    renderApp(`/games/18Test/charters/1`);
    expect(
      await screen.findByTestId("game-18Test-charter"),
    ).toBeInTheDocument();
  });

  it("can load and display a tile", async () => {
    renderApp(`/games/18Test/tiles/26`);
    expect(await screen.findByTestId("game-18Test-tile")).toBeInTheDocument();
  });

  it("can load and display a token", async () => {
    renderApp(`/games/18Test/tokens/1`);
    expect(await screen.findByTestId("game-18Test-token")).toBeInTheDocument();
  });
});
