import { screen, within } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("toolbar", () => {
  it("shows nothing for a section that does not exist", async () => {
    renderApp("/games/18Test/nonsense");

    // No crash, and none of the game controls
    await screen.findByTestId("game-18Test-nonsense").catch(() => null);
    expect(
      screen.queryByRole("combobox", { name: "Game Section" }),
    ).not.toBeInTheDocument();
  });

  it("toggles which cards are shown", async () => {
    const { user, router } = renderApp("/games/18Test/cards");
    await screen.findByTestId("game-18Test-cards");

    await user.click(screen.getByRole("button", { name: "Show" }));
    const privates = await screen.findByRole("menuitemcheckbox", {
      name: "Privates",
    });
    expect(privates).toBeChecked();

    await user.click(privates);
    expect(router.state.location.search).toContain("hidePrivates=true");
  });

  it("only offers the cards toggles on the cards page", async () => {
    renderApp("/games/18Test/tiles");
    await screen.findByTestId("game-18Test-tiles");

    expect(
      screen.queryByRole("button", { name: "Show" }),
    ).not.toBeInTheDocument();
  });
});

describe("edit link", () => {
  it("starts at the map when the game has one", async () => {
    renderApp("/games/18Test");
    const page = await screen.findByTestId("game-18Test");
    const link = within(page).getByRole("link", { name: "Edit Game" });
    expect(link).toHaveAttribute("href", "/games/18Test/map");
  });

  it("starts at the first section the game has data for", async () => {
    renderApp("/games/1888");
    const page = await screen.findByTestId("game-1888");
    const link = within(page).getByRole("link", { name: "Edit Game" });
    expect(link).not.toHaveAttribute("href", "/games/1888/map");
  });
});
