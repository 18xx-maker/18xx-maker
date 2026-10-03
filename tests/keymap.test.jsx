import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

const entries = (router) => router.state.historyAction;

describe("one keymap", () => {
  it("a section key on the edit page navigates once", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");
    const push = vi.spyOn(router, "navigate");

    await user.keyboard("2");
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
    await user.keyboard("2c");
    expect(router.state.location.pathname).toBe("/games/18Test/map");
  });

  it("the export menu is not opened by x outside of the app", async () => {
    const { user, store } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    await user.keyboard("x");
    expect(store.getState().ui.exportMenuOpen).toBe(false);
  });
});
