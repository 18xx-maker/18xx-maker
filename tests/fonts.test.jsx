import { screen, within } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

const fonts = {
  families: { fancy: "Georgia, serif" },
  roles: {
    title: { family: "fancy", weight: "normal" },
    card: { family: "x" },
  },
};

describe("central fonts", () => {
  it("sets the font of the names from the title role", async () => {
    renderApp("/games/18Test/map", { config: { fonts } });
    const map = await screen.findByTestId("game-18Test-map");
    const name = within(map).getAllByText("Montreal")[0];
    expect(name).toHaveAttribute("font-family", "Georgia, serif");
    expect(name).toHaveAttribute("font-weight", "normal");
  });

  it("sets the font of the private cards from the card role", async () => {
    renderApp("/games/18Test/cards", {
      config: { fonts: { roles: { card: { family: "fancy", weight: 500 } } } },
    });
    const cards = await screen.findByTestId("game-18Test-cards");
    const name = within(cards).getAllByText("Private with an icon")[0];
    expect(name).toHaveStyle({ fontFamily: "fancy" });
    expect(name).toHaveStyle({ fontWeight: "500" });
  });

  it("changes nothing without fonts", async () => {
    renderApp("/games/18Test/map");
    const map = await screen.findByTestId("game-18Test-map");
    const name = within(map).getAllByText("Montreal")[0];
    expect(name).toHaveAttribute("font-family", "sans-serif");
    expect(name).toHaveAttribute("font-weight", "bold");
  });
});
