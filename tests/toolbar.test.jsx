import { fireEvent, screen, waitFor, within } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

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

    await user.click(screen.getByRole("button", { name: "Filter" }));
    const privates = await screen.findByRole("menuitemcheckbox", {
      name: "Privates",
    });
    expect(privates).toBeChecked();

    await user.click(privates);
    expect(router.state.location.search).toContain("hidePrivates=true");
  });

  it("keeps the filter menu open while toggling, closes on outside click", async () => {
    const { user, router } = renderApp("/games/18Test/cards");
    await screen.findByTestId("game-18Test-cards");

    const trigger = screen.getByRole("button", { name: "Filter" });
    await user.click(trigger);
    await user.click(
      await screen.findByRole("menuitemcheckbox", { name: "Privates" }),
    );
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Shares" }));
    expect(router.state.location.search).toContain("hidePrivates=true");
    expect(router.state.location.search).toContain("hideShares=true");
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await user.click(trigger);
    await screen.findByRole("menu");
    // The open menu is modal: body has pointer-events none, so click outside
    // with a raw pointer event like a real browser does.
    fireEvent.pointerDown(document.body);
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  });

  it("labels the toolbar buttons with visible text", async () => {
    renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    expect(screen.getByRole("link", { name: "Game Info" })).toHaveTextContent(
      "Game Info",
    );
    expect(screen.getByRole("button", { name: "Config" })).toHaveTextContent(
      "Config",
    );
    expect(screen.getByRole("button", { name: "Print" })).toHaveTextContent(
      "Print",
    );
  });

  it("never squishes toolbar controls, whatever the language", async () => {
    renderApp("/games/18Test/cards");
    await screen.findByTestId("game-18Test-cards");

    [
      screen.getByRole("link", { name: "Game Info" }),
      screen.getByRole("button", { name: "Config" }),
      screen.getByRole("button", { name: "Print" }),
      screen.getByRole("button", { name: "Filter" }),
      screen.getByRole("combobox", { name: "Game Section" }),
    ].forEach((el) => {
      expect(el).toHaveClass("shrink-0");
    });
  });

  it("only offers the cards toggles on the cards page", async () => {
    renderApp("/games/18Test/tiles");
    await screen.findByTestId("game-18Test-tiles");

    expect(
      screen.queryByRole("button", { name: "Filter" }),
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
