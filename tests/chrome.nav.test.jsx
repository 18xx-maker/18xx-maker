/* eslint-disable testing-library/no-node-access -- the underline is a bare <u> with no role */
import { act, screen, waitFor, within } from "@testing-library/react";
import { page } from "vitest/browser";

import { clearAlert, createAlert } from "@/state";

import { renderApp } from "@tests/helpers.jsx";

// The viewport is set to phone size below, so the app sidebar is a sheet
// opened by the header's trigger. Game section pages have no sidebar: the
// toolbar is their navigation.
const trigger = () => screen.getByRole("button", { name: "Toggle Sidebar" });
const sidebar = () => screen.findByRole("dialog", { name: "Sidebar" });
const sections = () => screen.getByRole("combobox", { name: "Game Section" });

beforeEach(async () => {
  await page.viewport(414, 896);
});

describe("game toolbar", () => {
  it("navigates between sections with the section select", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    expect(await screen.findByTestId("game-18Test-map")).toBeInTheDocument();

    await user.click(sections());
    await user.click(await screen.findByRole("option", { name: /Tiles/ }));

    expect(router.state.location.pathname).toBe("/games/18Test/tiles");
    expect(await screen.findByTestId("game-18Test-tiles")).toBeInTheDocument();
  });

  it("jumps to a section with its number key", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    expect(await screen.findByTestId("game-18Test-map")).toBeInTheDocument();

    await user.keyboard("4");
    expect(router.state.location.pathname).toBe("/games/18Test/tiles");
    expect(await screen.findByTestId("game-18Test-tiles")).toBeInTheDocument();
  });

  it("marks the current section and disables missing ones", async () => {
    const { user } = renderApp("/games/1888/cards");
    expect(await screen.findByTestId("game-1888-cards")).toBeInTheDocument();
    expect(sections()).toHaveTextContent("Cards");

    await user.click(sections());
    expect(
      await screen.findByRole("option", { name: /Cards/ }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: /Revenue/ })).not.toHaveAttribute(
      "aria-selected",
      "true",
    );

    // 1888 has no map
    expect(screen.getByRole("option", { name: /Map/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("option", { name: /Revenue/ })).not.toHaveAttribute(
      "aria-disabled",
    );
  });

  it("goes back to the game info page", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    expect(await screen.findByTestId("game-18Test-map")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Game Info" }));
    expect(router.state.location.pathname).toBe("/games/18Test");
    expect(await screen.findByTestId("game-18Test")).toBeInTheDocument();
  });

  it("replaces the sidebar on section pages", async () => {
    renderApp("/games/18Test/map");
    expect(await screen.findByTestId("game-18Test-map")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Toggle Sidebar" }),
    ).not.toBeInTheDocument();
  });

  it("is hidden in print mode", async () => {
    renderApp("/games/18Test/map?print=true");
    expect(await screen.findByTestId("game-18Test-map")).toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Game Section" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Game Info" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "config" }),
    ).not.toBeInTheDocument();
  });
});

describe("app sidebar", () => {
  it("opens from the header and navigates", async () => {
    const { user, router } = renderApp("/");
    expect(await screen.findByTestId("home")).toBeInTheDocument();

    // Closed sheet content is not rendered
    expect(
      screen.queryByRole("link", { name: "Load Games" }),
    ).not.toBeInTheDocument();

    await user.click(trigger());
    await user.click(
      within(await sidebar()).getByRole("link", { name: "Load Games" }),
    );
    expect(router.state.location.pathname).toBe("/games");
    expect(await screen.findByTestId("games")).toBeInTheDocument();
    // Following a link closes the sheet
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );

    await user.click(trigger());
    await user.click(
      within(await sidebar()).getByRole("link", { name: "Tiles" }),
    );
    expect(router.state.location.pathname).toBe("/elements/tiles");
  });

  it("marks the current page", async () => {
    const { user } = renderApp("/elements/tiles");
    await user.click(trigger());
    const nav = await sidebar();

    expect(within(nav).getByRole("link", { name: "Tiles" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(nav).getByRole("link", { name: "Atoms" }),
    ).not.toHaveAttribute("aria-current");
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

    await user.click(trigger());
    const nav = await sidebar();
    expect(within(nav).getByRole("link", { name: "My Game" })).toHaveAttribute(
      "href",
      "/games/system:x",
    );
    expect(
      within(nav).getByRole("link", { name: "Edit Game" }),
    ).toHaveAttribute("href", "/games/system:x/map");
    expect(router.state.location.pathname).toBe("/");
  });

  it("has no game links without a loaded game", async () => {
    const { user } = renderApp("/");
    await user.click(trigger());
    expect(
      within(await sidebar()).queryByRole("link", { name: "Edit Game" }),
    ).not.toBeInTheDocument();
  });

  it("offers the update when one is available in the state", async () => {
    const { user } = renderApp("/", { update: { available: true } });
    expect(await screen.findByTestId("home")).toBeInTheDocument();

    await user.click(trigger());
    expect(
      within(await sidebar()).getByRole("link", { name: "Update" }),
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

describe("shortcut keys in the sidebar", () => {
  it("underlines the key and keeps the accessible name", async () => {
    const { user } = renderApp("/");
    await user.click(trigger());
    const panel = await sidebar();

    for (const [name, key] of [
      ["Home", "H"],
      ["Atoms", "A"],
      ["Tiles", "T"],
    ]) {
      const link = within(panel).getByRole("link", { name });
      expect(link.querySelector("u")).toHaveTextContent(key);
    }
    const logos = within(panel).getByRole("link", { name: "Company Logos" });
    expect(logos.querySelector("u")).toHaveTextContent("C");
    const positioning = within(panel)
      .getAllByRole("link", { name: /Auto Positioning/ })
      .find((link) => link.getAttribute("href") === "/elements/positioning");
    expect(positioning.querySelector("u")).toHaveTextContent("P");
    const docs = within(panel).getByRole("link", { name: "Using 18xx Maker" });
    expect(docs.querySelector("[aria-hidden] u")).toHaveTextContent("d");
  });
});
