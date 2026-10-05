import { screen } from "@testing-library/react";

import { games } from "@/data";

import { renderApp } from "@tests/support/helpers.jsx";

const entries = (router) => router.state.historyAction;

describe("one keymap", () => {
  it("a section key on the edit page navigates once", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");
    const push = vi.spyOn(router, "navigate");

    await user.keyboard("4");
    expect(push).toHaveBeenCalledTimes(1);
    expect(router.state.location.pathname).toBe("/games/18Test/tiles");
    expect(entries(router)).toBe("PUSH");
  });

  it("c toggles the config once on the edit page", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");
    const push = vi.spyOn(router, "navigate");

    await user.keyboard("c");
    expect(push).toHaveBeenCalledTimes(1);
    expect(router.state.location.search).toBe("?config=true");
    await user.keyboard("c");
    expect(router.state.location.search).toBe("");
  });

  it("the print page ignores the toolbar keys", async () => {
    const { user, router } = renderApp("/games/18Test/map?print=true");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("c2");
    expect(router.state.location.pathname).toBe("/games/18Test/map");
    expect(router.state.location.search).toBe("?print=true");
  });

  it("keys typed into a field are left to the field", async () => {
    const { user, router } = renderApp(
      "/games/18Test/map?config=true&section=layout",
    );
    await screen.findByTestId("game-18Test-map");

    const field = await screen.findByRole("textbox", { name: "Margin Size" });
    await user.click(field);
    const text = field.value;
    await user.keyboard("2c");
    expect(field).toHaveValue(`${text}2c`);
    expect(router.state.location.pathname).toBe("/games/18Test/map");
    expect(router.state.location.search).toBe("?config=true&section=layout");
  });

  it.for(["2", "c", "e"])("ctrl and meta with %s are ignored", async (key) => {
    const { user, router } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard(`{Control>}${key}{/Control}`);
    await user.keyboard(`{Meta>}${key}{/Meta}`);
    expect(router.state.location.pathname).toBe("/games/18Test/map");
    expect(router.state.location.search).toBe("");
  });

  it("e goes to the map when the redux game is another game", async () => {
    const other = {
      ...games["18Test"],
      map: undefined,
      meta: { ...games["18Test"].meta, slug: "other" },
    };
    const { user, router } = renderApp("/", {
      game: other,
      loadedGame: {
        title: "18Test",
        id: "18Test",
        type: "app",
        slug: "18Test",
      },
    });
    await screen.findByTestId("home");

    await user.keyboard("e");
    expect(router.state.location.pathname).toBe("/games/18Test/map");
  });

  it("the export menu is not opened by x outside of the app", async () => {
    const { user, store } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("x");
    expect(store.getState().ui.exportMenuOpen).toBe(false);
  });
});
