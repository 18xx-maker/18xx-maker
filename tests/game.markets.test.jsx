import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("game markets", () => {
  it.for([
    ["18SJ", "Örjan Wennman"],
    ["18TraXX2020", "Michael Carter and Anthony Fryer"],
    ["1867", "Ian Wilson"],
  ])("%s can display it's market", async ([game, author]) => {
    const re = new RegExp(`by ${author}`, "i");

    renderApp(`/games/${game}/market`);

    expect(await screen.findByRole("link", { name: re })).toBeInTheDocument();
  });
});
