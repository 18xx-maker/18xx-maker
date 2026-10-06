import { screen } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

// The css of the cards sets the size of the card in the die layouts
const cardCss = () =>
  // eslint-disable-next-line testing-library/no-node-access
  [...document.querySelectorAll("style")]
    .map((style) => style.textContent)
    .find((text) => text.includes(".card__body"));

const bodySize = (css) =>
  css
    .match(/\.card__body\s*{[^}]*width:\s*([\d.]+)in;\s*height:\s*([\d.]+)in/)
    .slice(1)
    .map(Number);

describe("die layouts", () => {
  it("use the size of the die of the config", async () => {
    renderApp("/games/18Test/cards?print=true");
    await screen.findByTestId("game-18Test-cards");
    expect(bodySize(cardCss())).toEqual([2.65748, 1.73228]);
  });

  it("use another size, a number even from the url", async () => {
    renderApp(
      "/games/18Test/cards?print=true&config.cards.dice.miniEuroDie.width=300&config.cards.dice.miniEuroDie.height=200",
    );
    await screen.findByTestId("game-18Test-cards");
    expect(bodySize(cardCss())).toEqual([3, 2]);
  });

  it("take the padding off the dtg die", async () => {
    renderApp(
      "/games/18Test/cards?print=true&config.cards.layout=dtgDie&config.cards.dtgPadding=10",
    );
    await screen.findByTestId("game-18Test-cards");
    expect(bodySize(cardCss())).toEqual([2.3, 1.3]);
  });

  it("use the size of a type of card on the die", async () => {
    renderApp(
      "/games/18Test/cards?print=true&config.cards.dice.miniEuroDie.sizes.share.width=200&config.cards.dice.miniEuroDie.sizes.share.height=100",
    );
    await screen.findByTestId("game-18Test-cards");
    const css = cardCss();
    // The sizes are laid out on their own pages
    expect(css).toContain(".cards-group-0 .card__body");
    expect(css).toContain("width: 2in");
  });
});
