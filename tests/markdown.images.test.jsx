import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("markdown images", () => {
  it("are captioned figures with rounded borders on doc pages", async () => {
    renderApp("/docs/games/logos");
    const image = await screen.findByRole("img", {
      name: /purple company token/,
    });

    expect(image).not.toHaveClass("float-right");
    expect(image).toHaveClass("rounded-lg", "border");
    expect(image).not.toHaveAttribute("title");
    const figure = screen.getAllByRole("figure")[0];
    expect(figure).toContainElement(image);
    expect(figure).toHaveTextContent("none");
    // A figure can't sit in a paragraph
    // eslint-disable-next-line testing-library/no-node-access
    expect(image.closest("p")).toBeNull();
  });

  it("swap UI screenshots with their dark twin by theme", async () => {
    renderApp("/docs/output/png");
    const pair = await screen.findAllByRole("img", { name: /export button/i });

    expect(pair).toHaveLength(2);
    expect(pair[0]).toHaveAttribute("src", "/images/export-button-light.png");
    expect(pair[0]).toHaveClass("dark:hidden");
    expect(pair[1]).toHaveAttribute("src", "/images/export-button-dark.png");
    expect(pair[1]).toHaveClass("hidden", "dark:inline");
    expect(pair[1]).toHaveAttribute("alt", pair[0].getAttribute("alt"));
  });

  it("are floated right on the home page", async () => {
    renderApp("/");
    const page = await screen.findByTestId("home");
    const image = await screen.findByRole("img", { name: /Grand Trunk/ });

    expect(page).toContainElement(image);
    // eslint-disable-next-line testing-library/no-node-access
    expect(image.closest("div[class*='float-right']")).not.toBeNull();
  });
});
