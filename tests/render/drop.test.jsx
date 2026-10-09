import { act, screen } from "@testing-library/react";

import { dropFiles, pngFile, svgFile } from "@tests/support/drop.js";
import { renderApp } from "@tests/support/helpers.jsx";
import { makePng } from "@tests/support/png.js";

const holder = vi.hoisted(() => ({ input: undefined }));

vi.mock("@/util/renderInput", async () => {
  const { games: bundled } = await import("@/data");
  const { renderGame } = await import("../../src/export/render.js");
  holder.input = {
    id: "18Test",
    game: renderGame(bundled["18Test"], "18Test"),
    config: {},
  };
  return { getRenderInput: () => holder.input };
});

describe("render mode", () => {
  it("ignores dropped files", async () => {
    const { store } = renderApp("/games/render:18Test/map");
    await screen.findByTestId("game-render:18Test-map");
    const { alert, assets } = store.getState();

    dropFiles([svgFile("star.svg"), pngFile(makePng())]);
    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(store.getState().alert).toBe(alert);
    expect(store.getState().assets).toBe(assets);
  });
});
