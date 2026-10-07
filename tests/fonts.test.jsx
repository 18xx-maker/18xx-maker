import { screen, within } from "@testing-library/react";

import { games } from "@/data";

import { renderApp } from "@tests/support/helpers.jsx";

const fonts = {
  families: { fancy: "Georgia, serif" },
  roles: {
    title: { family: "fancy", weight: "normal" },
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

  describe("fields of the game", () => {
    const game = games["18Test"];
    let info;
    let private0;

    beforeEach(() => {
      info = game.info;
      private0 = game.privates[0];
    });

    afterEach(() => {
      game.info = info;
      game.privates[0] = private0;
    });

    it("wins over the title role on the names", async () => {
      game.info = {
        ...info,
        nameFontFamily: "monospace",
        nameFontWeight: "900",
      };
      renderApp("/games/18Test/map", { config: { fonts } });
      const map = await screen.findByTestId("game-18Test-map");
      const name = within(map).getAllByText("Montreal")[0];
      expect(name).toHaveAttribute("font-family", "monospace");
      expect(name).toHaveAttribute("font-weight", "900");
    });

    it("wins over the card role on the private cards", async () => {
      game.privates[0] = {
        ...private0,
        nameFontFamily: "monospace",
        nameFontWeight: 900,
      };
      renderApp("/games/18Test/cards", {
        config: {
          fonts: { roles: { card: { family: "fancy", weight: 500 } } },
        },
      });
      const cards = await screen.findByTestId("game-18Test-cards");
      const name = within(cards).getAllByText("Private with an icon")[0];
      expect(name).toHaveStyle({ fontFamily: "monospace" });
      expect(name).toHaveStyle({ fontWeight: "900" });
    });
  });

  it("changes nothing without fonts", async () => {
    renderApp("/games/18Test/map");
    const map = await screen.findByTestId("game-18Test-map");
    const name = within(map).getAllByText("Montreal")[0];
    expect(name).toHaveAttribute("font-family", "sans-serif");
    expect(name).toHaveAttribute("font-weight", "bold");
  });
});
