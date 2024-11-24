import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("bindings", () => {
  it("pressing h and g brings to home and back to the game page", async () => {
    const { user } = renderApp("/games/1889/map");
    expect(await screen.findByTestId("game-1889-map")).toBeInTheDocument();

    await user.keyboard("h");
    expect(await screen.findByTestId("home")).toBeInTheDocument();

    await user.keyboard("g");
    expect(await screen.findByTestId("game-1889-map")).toBeInTheDocument();
  });
});
