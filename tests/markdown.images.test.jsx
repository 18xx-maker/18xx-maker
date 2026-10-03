import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("markdown images", () => {
  it("are not floated on doc pages", async () => {
    renderApp("/docs/games/logos");
    const image = await screen.findByRole("img", { name: "none" });

    expect(image).not.toHaveClass("float-right");
    // Tailwind makes images blocks, which would put each on its own line
    expect(image).toHaveClass("inline");
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
