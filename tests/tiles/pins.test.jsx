import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderApp } from "../support/helpers";

const pins = async (tiles) => {
  renderApp("/games/18Test/tiles", { config: { tiles } });
  const sheet = await screen.findByTestId("game-18Test-tiles");
  // eslint-disable-next-line testing-library/no-node-access
  return sheet.querySelectorAll('.TileSheet--Page circle[fill="gray"]').length;
};

describe("tile sheet pins", () => {
  it.each(["offset", "individual"])(
    "draws no pins in the free %s layout by default",
    async (layout) => {
      expect(await pins({ layout })).toBe(0);
    },
  );

  it.each(["offset", "individual"])(
    "draws pins in the free %s layout with showPins",
    async (layout) => {
      expect(await pins({ layout, showPins: true })).toBeGreaterThan(0);
    },
  );

  it.each(["die", "smallDie"])(
    "always draws pins in the %s layout",
    async (layout) => {
      expect(await pins({ layout, showPins: false })).toBeGreaterThan(0);
    },
  );
});
