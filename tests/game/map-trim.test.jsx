import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderApp } from "../support/helpers";

/* eslint-disable testing-library/no-node-access */
const viewBox = (el) => el.querySelector("svg").getAttribute("viewBox");

// 18Test trims the bottom and right of its map, and its B10 is a right half
describe("map trim and half", () => {
  it("makes the map page smaller by the trimmed edges", async () => {
    renderApp("/games/18Test/map?print=true");
    const map = await screen.findByTestId("game-18Test-map");
    const [, , w, h] = viewBox(map).split(" ").map(Number);
    // 150 wide hexes, outside coordinates, x up to 17 and y up to 4, less half
    // a column and half a row
    expect(w).toBeCloseTo(100 + 75 * 18 - 75);
    expect(h).toBeCloseTo(100 + 1.5 * 3 * 86.6025 + 2 * 86.6025 - 86.6025, 1);
  });

  it("clips the halves and draws their borders to the cut", async () => {
    renderApp("/games/18Test/map?print=true");
    const map = await screen.findByTestId("game-18Test-map");
    // B10, the bottom row D12, D14, D16 and the right column A17, C17 each
    // have a clip of their own and a clip of their border
    const seams = map.querySelectorAll("clipPath[id^='hexSeamClip']");
    const borders = map.querySelectorAll("clipPath[id^='hexBorderClip']");
    expect(seams.length).toBeGreaterThanOrEqual(6);
    expect(borders.length).toBeGreaterThanOrEqual(6);
    // A half has fewer than the six corners of a hex
    const cuts = [...seams].map(
      (s) =>
        s.querySelector("polygon").getAttribute("points").split(" ").length,
    );
    expect(cuts).toContain(5);
  });

  it("splits the trimmed map over the pages like its size", async () => {
    renderApp("/games/18Test/map?paginated=true");
    const map = await screen.findByTestId("game-18Test-map-paginated");
    expect(map.querySelectorAll(".paginated__page").length).toBeGreaterThan(0);
  });
});
