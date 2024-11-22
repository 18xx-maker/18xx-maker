import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("bindings", () => {
  it("pressing h and g brings to home and back to the game page", async () => {
    const { user } = renderApp("/games/1889/map");
    expect(
      await screen.findByRole("link", { name: /by Yasutaka Ikeda/i }),
    ).toBeInTheDocument();

    await user.keyboard("h");
    expect(
      await screen.findByRole("heading", { name: "Usage" }),
    ).toBeInTheDocument();

    await user.keyboard("g");
    expect(
      await screen.findByRole("link", { name: /by Yasutaka Ikeda/i }),
    ).toBeInTheDocument();
  });
});
