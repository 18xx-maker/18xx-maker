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
    // room for the hover heading anchor, which hangs left of the text
    // eslint-disable-next-line testing-library/no-node-access
    expect(docs.querySelector(".max-w-200.p-4")).toHaveClass("pl-12");
    // the page title has no anchor
    // eslint-disable-next-line testing-library/no-node-access
    expect(docs.querySelector("h1")).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(docs.querySelector("h1 [data-anchor]")).toBeNull();
    // the anchor ends at the heading's left edge whatever the heading size,
    // so it never overlaps the heading text
    // eslint-disable-next-line testing-library/no-node-access
    const anchor = docs.querySelector("h2 [data-anchor], h3 [data-anchor]");
    expect(anchor).not.toBeNull();
    expect(anchor).toHaveClass("right-full");
    expect(anchor).not.toHaveClass("-left-6");
  });

  it("leaves the home page at the default width", async () => {
    renderApp("/");
    const home = await screen.findByTestId("home");
    // eslint-disable-next-line testing-library/no-node-access
    const article = home.firstElementChild;

    expect(article).toHaveClass("max-w-prose");
    expect(article).not.toHaveClass("max-w-200");
    expect(article).toHaveClass("pl-12");
  });
});
