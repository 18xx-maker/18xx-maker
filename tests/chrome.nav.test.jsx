import { act, screen, waitFor } from "@testing-library/react";

import { clearAlert, createAlert } from "@/state";

import { renderApp } from "@tests/helpers.jsx";

// The component browser project runs at a phone sized viewport, so the side
// nav is the temporary drawer opened by the hamburger button.
// The suite includes hidden elements by default, but the permanent drawer is
// display:none on a phone, so ask for what the user can actually see
const visible = { hidden: false };

// eslint-disable-next-line testing-library/no-node-access -- the icon button has no accessible name
const hamburger = () => screen.getAllByTestId("MenuIcon")[0].closest("button");

describe("side nav", () => {
  it("opens from the hamburger and navigates with the game nav links", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    expect(await screen.findByTestId("game-18Test-map")).toBeInTheDocument();

    // Closed drawer content is hidden
    expect(
      screen.queryByRole("link", { name: "Tiles", ...visible }),
    ).not.toBeInTheDocument();

    await user.click(hamburger());
    await user.click(
      await screen.findByRole("link", { name: "Tiles", ...visible }),
    );

    expect(router.state.location.pathname).toBe("/games/18Test/tiles");
    expect(await screen.findByTestId("game-18Test-tiles")).toBeInTheDocument();
  });

  it("marks the current section as selected and disables missing ones", async () => {
    const { user } = renderApp("/games/1888/");
    expect(await screen.findByTestId("game-1888")).toBeInTheDocument();
    await user.click(hamburger());

    // 1888 has no map
    expect(
      await screen.findByRole("link", { name: "Map", ...visible }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("link", { name: "Cards", ...visible }),
    ).not.toHaveAttribute("aria-disabled", "true");
  });

  it("shows the elements and docs menus", async () => {
    const { user, router } = renderApp("/elements");
    expect(await screen.findByTestId("atoms")).toBeInTheDocument();

    await user.click(hamburger());
    await user.click(
      await screen.findByRole("link", { name: /Tiles/, ...visible }),
    );
    expect(router.state.location.pathname).toBe("/elements/tiles");
  });

  it("has no hamburger on pages without a side menu", async () => {
    renderApp("/");
    expect(await screen.findByTestId("home")).toBeInTheDocument();
    expect(screen.queryByTestId("MenuIcon")).not.toBeInTheDocument();
  });

  it("is hidden in print mode", async () => {
    renderApp("/games/18Test/map?print=true");
    expect(await screen.findByTestId("game-18Test-map")).toBeInTheDocument();
    expect(screen.queryByTestId("MenuIcon")).not.toBeInTheDocument();
  });
});

describe("app menu", () => {
  it("navigates with the mobile menu", async () => {
    const { user, router } = renderApp("/");
    expect(await screen.findByTestId("home")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Home" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "Load Games" }),
    );
    expect(router.state.location.pathname).toBe("/games/");
    expect(await screen.findByTestId("games")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Load Games" }));
    await user.click(await screen.findByRole("menuitem", { name: "Elements" }));
    expect(router.state.location.pathname).toBe("/elements/");
  });

  it("links to the loaded game from the state", async () => {
    const { user, router } = renderApp("/", {
      loadedGame: {
        title: "My Game",
        id: "x",
        type: "system",
        slug: "system:x",
      },
    });
    expect(await screen.findByTestId("home")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Home" }));
    expect(
      await screen.findByRole("menuitem", { name: "My Game" }),
    ).toHaveAttribute("href", "/games/system:x/map");
    expect(router.state.location.pathname).toBe("/");
  });

  it("offers the update when one is available in the state", async () => {
    const { user } = renderApp("/", { update: { available: true } });
    expect(await screen.findByTestId("home")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Home" }));
    expect(
      await screen.findByRole("menuitem", { name: "Update" }),
    ).toHaveAttribute("href", "/app");
  });
});

describe("alerts", () => {
  it("shows an alert from state and clears it", async () => {
    const { store } = renderApp("/");
    expect(await screen.findByTestId("home")).toBeInTheDocument();
    expect(screen.queryByText("It worked")).not.toBeInTheDocument();

    act(() => {
      store.dispatch(createAlert("Game Loaded", "It worked", "success"));
    });
    expect(await screen.findByText("It worked")).toBeInTheDocument();
    expect(screen.getByText("Game Loaded")).toBeInTheDocument();

    act(() => {
      store.dispatch(clearAlert());
    });
    await waitFor(() =>
      expect(screen.queryByText("It worked")).not.toBeInTheDocument(),
    );
  });
});
