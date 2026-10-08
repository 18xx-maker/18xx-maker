/* eslint-disable testing-library/no-node-access */
import { screen } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

// Render mode (the exports) draws the tile sheet as it prints: no layer to
// pick tiles, no cell to add one, even with the edit panel asked for. The
// input is read when the modules load, so it is set before them.
vi.mock("@/util/renderInput", async () => {
  const { games } = await import("@/data");
  const { renderGame } = await import("../../src/export/render.js");
  const input = {
    id: "18Test",
    game: renderGame(games["18Test"], "18Test"),
    config: {},
  };
  return { getRenderInput: () => input };
});

describe("render mode and the tile sheet", () => {
  it("has no overlay and no cell to add a tile", async () => {
    renderApp("/games/render:18Test/tiles?edit=true");
    await screen.findByTestId("game-render:18Test-tiles");
    expect(screen.queryByTestId("tiles-overlay")).not.toBeInTheDocument();
    expect(document.querySelector("[data-next]")).toBeNull();
  });
});
