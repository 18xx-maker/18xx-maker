import { screen, within } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

// The map svg has no role to query by
const printElement = (page) =>
  // eslint-disable-next-line testing-library/no-node-access
  page.querySelector("svg.printElement");

describe("map editor", () => {
  it("shows the pan and zoom editor on screen", async () => {
    renderApp("/games/18Test/map");
    const page = await screen.findByTestId("game-18Test-map");

    // The svg fills the window, it is not at its physical size
    expect(printElement(page)).toHaveAttribute(
      "width",
      expect.stringMatching(/px$/),
    );
  });

  it("renders the svg at its physical size with ?print=true", async () => {
    renderApp("/games/18Test/map?print=true");
    const page = await screen.findByTestId("game-18Test-map");

    const svg = printElement(page);
    expect(svg).toHaveAttribute("width", expect.stringMatching(/in$/));
    expect(svg).toHaveAttribute("height", expect.stringMatching(/in$/));
  });

  it("hides the toolbar with ?print=true", async () => {
    renderApp("/games/18Test/map?print=true");
    await screen.findByTestId("game-18Test-map");

    expect(
      screen.queryByRole("combobox", { name: "Game Section" }),
    ).not.toBeInTheDocument();
    expect(
      within(document.body).queryByRole("button", { name: "Config" }),
    ).not.toBeInTheDocument();
  });
});

// The test page has no Tailwind stylesheet, so the classes are what is checked
// (the layout itself is verified in the built site)
// eslint-disable-next-line testing-library/no-node-access
const viewportChildren = () => document.getElementById("viewport-children");

describe("plain game pages", () => {
  it("start below the toolbar and center their content", async () => {
    renderApp("/games/18Test/cards/private/0");
    await screen.findByTestId("game-18Test-card");

    expect(viewportChildren()).toHaveClass(
      "not-has-[#editor]:pt-16",
      "not-has-[#editor]:flex",
    );
  });

  it("have no padding or centering with ?print=true", async () => {
    renderApp("/games/18Test/cards/private/0?print=true");
    await screen.findByTestId("game-18Test-card");

    expect(viewportChildren()).not.toHaveClass("not-has-[#editor]:pt-16");
  });
});
