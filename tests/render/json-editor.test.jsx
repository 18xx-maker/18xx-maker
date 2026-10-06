import { screen, waitFor } from "@testing-library/react";

import { games } from "@/data";

import { allowConsole } from "@tests/support/console.js";
import { renderApp } from "@tests/support/helpers.jsx";

// Render mode (the exports): no edit panel, no JSON editor, and a page that
// cannot draw fails instead of showing a notice. The input is read when the
// modules load, so it is set before them.
const holder = vi.hoisted(() => ({ input: undefined }));

vi.mock("@/util/renderInput", async () => {
  const { games: bundled } = await import("@/data");
  const { renderGame } = await import("../../src/export/render.js");
  holder.input = {
    id: "18Test",
    game: renderGame({ ...bundled["18Test"], map: 5 }, "18Test"),
    config: {},
  };
  return { getRenderInput: () => holder.input };
});

describe("render mode and the json editor", () => {
  it("j does nothing", async () => {
    const { user, router } = renderApp("/games/render:18Test/tokens");
    await screen.findByTestId("game-render:18Test-tokens");
    await user.keyboard("j");
    expect(router.state.location.search).toBe("");
    expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("json-editor")).not.toBeInTheDocument();
  });

  it("does not catch a page that cannot draw", async () => {
    allowConsole(/./);
    renderApp("/games/render:18Test/map?edit=true");
    await screen.findByTestId("route-error");
    await waitFor(() =>
      expect(screen.queryByTestId("render-error")).not.toBeInTheDocument(),
    );
    expect(games["18Test"].map).not.toBe(5);
  });
});
