import { screen } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

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

  // The card root sets the print font for the SVG labels; the description
  // text under the SVG is body text and must not inherit it.
  const expectBodyFont = (card) => {
    // eslint-disable-next-line testing-library/no-node-access
    const description = card.querySelector(".border-t.bg-background");
    expect(description).toHaveClass("font-sans", "font-normal");
    expect(description).not.toHaveClass("font-bold");
    expect(description).not.toHaveClass("font-display");
  };

  it("shows positioning descriptions in the body font", async () => {
    renderApp("/elements/positioning");
    const page = await screen.findByTestId("positioning");

    // eslint-disable-next-line testing-library/no-node-access
    const card = page.querySelector(".checkered");
    expect(card).toHaveClass("font-display", "font-bold");
    expectBodyFont(card);
  });

  it("shows atom descriptions in the body font", async () => {
    renderApp("/elements?group=Track");
    const page = await screen.findByTestId("atoms");

    // eslint-disable-next-line testing-library/no-node-access
    const description = page.querySelector(".border-t.bg-background");
    expect(description).not.toBeNull();
    // eslint-disable-next-line testing-library/no-node-access
    const card = description.closest(".checkered");
    expect(card).toHaveClass("font-display", "font-bold");
    expectBodyFont(card);
  });
});
