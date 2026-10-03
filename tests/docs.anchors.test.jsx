import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("docs heading anchors", () => {
  it("gives headings an id and a link to it", async () => {
    renderApp("/docs/games/exports");
    const page = await screen.findByTestId("docs-games/exports");
    const heading = await screen.findByRole("heading", {
      level: 2,
      name: /Which value wins/,
    });

    expect(page).toContainElement(heading);
    expect(heading).toHaveAttribute("id", "which-value-wins");
    expect(
      screen.getByRole("link", { name: "#which-value-wins" }),
    ).toHaveAttribute("href", "/docs/games/exports#which-value-wins");
  });

  it("scrolls to the heading of the url hash", async () => {
    renderApp("/docs/games/exports#checking");
    const heading = await screen.findByRole("heading", { name: /Checking/ });

    await expect
      .poll(() => heading.getBoundingClientRect().top)
      .toBeLessThan(window.innerHeight);
    expect(window.scrollY).toBeGreaterThan(0);
  });
});
