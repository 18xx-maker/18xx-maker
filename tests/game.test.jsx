import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("the app", () => {
  it("can navigate to and display 1871", async () => {
    const { user } = renderApp();

    const loadGamesLink = screen.getByRole("link", { name: "Load Games" });
    expect(loadGamesLink).toBeInTheDocument();
    await user.click(loadGamesLink);

    const gameLink = screen.getByRole("link", {
      name: "The Old Prince 1871",
    });
    expect(gameLink).toBeInTheDocument();
    await user.click(gameLink);

    expect(
      screen.getByRole("link", { name: /by Lucas Boyd/i }),
    ).toBeInTheDocument();
  });
});
