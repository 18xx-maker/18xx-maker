import { screen, waitFor } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

// Render mode has no edit panel: j is not a key there
vi.mock("@/util/renderInput", async () => {
  const { games: bundled } = await import("@/data");
  const { renderGame } = await import("../../src/export/render.js");
  return {
    getRenderInput: () => ({
      id: "18Test",
      game: renderGame(bundled["18Test"], "18Test"),
      config: {},
    }),
  };
});

describe("render mode keys", () => {
  it("j does not open the json editor", async () => {
    const { user, router } = renderApp("/games/render:18Test/problems");
    await waitFor(() =>
      expect(document.body.dataset.renderState).toBeDefined(),
    );
    await user.keyboard("j");
    expect(router.state.location.pathname).toBe(
      "/games/render:18Test/problems",
    );
    expect(router.state.location.search).toBe("");
    expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument();
  });
});
