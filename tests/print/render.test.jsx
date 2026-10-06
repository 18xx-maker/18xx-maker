import { screen, waitFor } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

// Render mode (the exports) is given a config with a print scale
const holder = vi.hoisted(() => ({ input: undefined }));

vi.mock("@/util/renderInput", async () => {
  const { games: bundled } = await import("@/data");
  const { renderGame } = await import("../../src/export/render.js");
  holder.input = {
    id: "18Test",
    game: renderGame(bundled["18Test"], "18Test"),
    config: { printScale: 110 },
  };
  return { getRenderInput: () => holder.input };
});

describe("print scale in render mode", () => {
  it("is ignored, an export has a fixed size", async () => {
    renderApp("/games/render:18Test/cards?config.printScale=130");
    const root = await screen.findByTestId("game-render:18Test-cards");

    await waitFor(() =>
      expect(document.body.dataset.renderState).toBe("ready"),
    );
    // eslint-disable-next-line testing-library/no-node-access
    const viewport = document.getElementById("viewport-children");
    expect(viewport).not.toHaveAttribute("data-print-scale");
    expect(getComputedStyle(root).zoom).toBe("1");
  });
});
