import { screen, waitFor, within } from "@testing-library/react";

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

    await user.keyboard("4");
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
    ["7", "par"],
    ["8", "revenue"],
    ["9", "tile-manifest"],
    ["0", "background"],
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
    expect(router.state.location.pathname).toBe("/games/t/market");
  });
});

describe("shortcuts dialog", () => {
  it("? opens it from anywhere, ? or esc closes it and other keys wait", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("?");
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Keyboard shortcuts")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Navigate to the Home page"),
    ).toBeInTheDocument();

    await user.keyboard("h");
    expect(router.state.location.pathname).toBe("/games/18Test/map");

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(router.state.location.pathname).toBe("/games/18Test/map");

    await user.keyboard("??");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("is the same list the docs show", async () => {
    renderApp("/docs");
    const docs = await screen.findByTestId("docs-index");
    expect(
      within(docs).getByText("Navigate to the Home page"),
    ).toBeInTheDocument();
  });
});

describe("esc and d", () => {
  it("d goes to the first docs page", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("d");
    expect(router.state.location.pathname).toBe("/docs");
  });

  it("a run of esc closes config, leaves the editor, then goes home", async () => {
    const { user, router } = renderApp("/games/18Test/map?config=true");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("{Escape}");
    expect(router.state.location.pathname).toBe("/games/18Test/map");
    expect(router.state.location.search).toBe("");

    await user.keyboard("{Escape}");
    expect(router.state.location.pathname).toBe("/games/18Test");

    await user.keyboard("{Escape}");
    expect(router.state.location.pathname).toBe("/");

    await user.keyboard("{Escape}");
    expect(router.state.location.pathname).toBe("/");
  });

  it("esc goes home from other pages", async () => {
    const { user, router } = renderApp("/elements/tiles");
    await screen.findByTestId("tiles");

    await user.keyboard("{Escape}");
    expect(router.state.location.pathname).toBe("/");
  });
});

describe("cycle keys", () => {
  it("[ and ] cycle the sections on the edit page", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("]");
    await waitFor(() =>
      expect(router.state.location.pathname).not.toBe("/games/18Test/map"),
    );
    const next = router.state.location.pathname;

    await user.keyboard("[[");
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/18Test/map"),
    );
    expect(next).toMatch(/^\/games\/18Test\/\w/);
  });

  it("[ and ] cycle the config sections while the panel is open", async () => {
    const { user, router } = renderApp("/games/18Test/map?config=true");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("]");
    await waitFor(() =>
      expect(router.state.location.search).toContain("section="),
    );
    expect(router.state.location.pathname).toBe("/games/18Test/map");

    await user.keyboard("[[");
    await waitFor(() =>
      expect(router.state.location.search).toBe("?config=true"),
    );
  });

  it("[ and ] go to the previous and next docs page", async () => {
    const { user, router } = renderApp("/docs");

    await user.keyboard("[[");
    expect(router.state.location.pathname).toBe("/docs");

    await user.keyboard("]");
    await waitFor(() =>
      expect(router.state.location.pathname).not.toBe("/docs"),
    );

    await user.keyboard("[[");
    await waitFor(() => expect(router.state.location.pathname).toBe("/docs"));
  });
});
