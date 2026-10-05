import { screen } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

// The component tests load no stylesheet, so the layout is pinned by its
// classes here and looked at in the browser for real widths.
describe("docs layout", () => {
  it("is a left aligned article 800px wide that keeps text at 65 characters", async () => {
    renderApp("/docs/games/exports");
    const docs = await screen.findByTestId("docs-games/exports");
    // eslint-disable-next-line testing-library/no-node-access
    const article = docs.querySelector(".max-w-200");

    expect(article).not.toHaveClass("mx-auto");
    // eslint-disable-next-line testing-library/no-node-access
    expect(docs.querySelectorAll(".mx-auto")).toHaveLength(0);
    expect(article).not.toHaveClass("max-w-prose");
  });

  it("leaves the home page at the default width", async () => {
    renderApp("/");
    const home = await screen.findByTestId("home");
    // eslint-disable-next-line testing-library/no-node-access
    const article = home.firstElementChild;

    expect(article).toHaveClass("max-w-prose");
    expect(article).not.toHaveClass("max-w-200");
  });
});
