import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("game configs", () => {
  it.for(["outside", "inside", "edge", "none"])(
    "can display the %s coord option",
    async (coords) => {
      renderApp(`/games/18Test/map?config.coords=${coords}`);
      expect(await screen.findByTestId("game-18Test-map")).toBeInTheDocument();
    },
  );

  it("can display company overrides", async () => {
    renderApp("/games/18Test/tokens?config.overrideCompanies=webdev");
    expect(await screen.findByTestId("game-18Test-tokens")).toBeInTheDocument();
  });
});
