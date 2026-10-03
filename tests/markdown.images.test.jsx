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

  it("are floated right on the home page", async () => {
    renderApp("/");
    const page = await screen.findByTestId("home");
    const image = await screen.findByRole("img", { name: /Grand Trunk/ });

    expect(page).toContainElement(image);
    // eslint-disable-next-line testing-library/no-node-access
    expect(image.closest("div[class*='float-right']")).not.toBeNull();
  });
});
