import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

// Tile labels without a font of their own inherit it. In the editor that is
// the print font (#viewport-children), so the elements pages must set the
// same font around their tiles.
describe("elements pages fonts", () => {
  it("shows tiles in the print font", async () => {
    renderApp("/elements/tiles");
    const page = await screen.findByTestId("tiles");

    // eslint-disable-next-line testing-library/no-node-access
    const card = page.querySelector(".checkered");
    expect(card).toHaveClass("font-display", "font-bold");
  });

  it("shows atoms in the print font", async () => {
    renderApp("/elements");
    const page = await screen.findByTestId("atoms");

    // eslint-disable-next-line testing-library/no-node-access
    const card = page.querySelector(".checkered");
    expect(card).toHaveClass("font-display", "font-bold");
  });
});
