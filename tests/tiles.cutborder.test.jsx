import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderApp } from "./helpers";

const count = async (tiles) => {
  renderApp("/games/18Test/tiles", { config: { tiles } });
  const sheet = await screen.findByTestId("game-18Test-tiles");
  /* eslint-disable testing-library/no-node-access */
  return {
    tiles: sheet.querySelectorAll("svg > g[clip-path]").length,
    borders: sheet.querySelectorAll(".TileSheet--CutBorder").length,
  };
};

describe("tile sheet cut borders", () => {
  it.each(["offset", "individual", "die", "smallDie"])(
    "draws one border per tile in the %s layout",
    async (layout) => {
      const { tiles, borders } = await count({ layout, cutBorder: true });
      expect(tiles).toBeGreaterThan(0);
      expect(borders).toBe(tiles);
    },
  );

  it("draws no borders by default", async () => {
    const { tiles, borders } = await count({ layout: "die" });
    expect(tiles).toBeGreaterThan(0);
    expect(borders).toBe(0);
  });
});
