import { screen } from "@testing-library/react";

import { games } from "@/data";

import { renderApp } from "@tests/helpers.jsx";

describe("bindings", () => {
  it("pressing h and g brings to home and back to the game page", async () => {
    const { user } = renderApp("/games/1889/map");
    expect(await screen.findByTestId("game-1889-map")).toBeInTheDocument();

    await user.keyboard("h");
    expect(await screen.findByTestId("home")).toBeInTheDocument();

    await user.keyboard("g");
    expect(await screen.findByTestId("game-1889")).toBeInTheDocument();
  });
});

describe("game keys", () => {
  it("e, esc and g move between the game page and the edit page", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("{Escape}");
    await screen.findByTestId("game-18Test");
    expect(router.state.location.pathname).toBe("/games/18Test");

    await user.keyboard("e");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("e");
    await screen.findByTestId("game-18Test");

    await user.keyboard("m");
    await screen.findByTestId("game-18Test-map");
  });

  it("a number goes to its section from outside the edit page", async () => {
    const { user, router } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");

    await user.keyboard("2");
    expect(router.state.location.pathname).toBe("/games/18Test/tiles");
  });

  it("a, t and c leave the game page but not the edit page", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("at");
    expect(router.state.location.pathname).toBe("/games/18Test/map");
    // c toggles the config panel instead
    expect(router.state.location.search).toBe("");
    await user.keyboard("c");
    expect(router.state.location.search).toBe("?config=true");
  });
});

describe("section keys", () => {
  it.for([
    ["8", "par"],
    ["9", "revenue"],
    ["0", "tile-manifest"],
  ])("%s goes to %s", async ([key, section]) => {
    const { user, router } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard(key);
    expect(router.state.location.pathname).toBe(`/games/18Test/${section}`);
  });
});

describe("e key", () => {
  it("goes to the first available section of the game", async () => {
    const { user, router } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");

    await user.keyboard("e");
    expect(router.state.location.pathname).toBe("/games/18Test/map");
  });

  it("skips a map the game does not have", async () => {
    const { user, router } = renderApp("/", {
      loadedGame: { title: "t", id: "t", type: "app", slug: "t" },
      game: {
        ...games["18Test"],
        map: undefined,
        meta: { id: "t", type: "app", slug: "t" },
      },
    });
    await screen.findByTestId("home");

    await user.keyboard("e");
    expect(router.state.location.pathname).toBe("/games/t/tiles");
  });
});
