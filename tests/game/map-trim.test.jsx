import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Hex from "@/components/Hex";

import { renderApp } from "../support/helpers";
import { drawSvg } from "../support/render";

/* eslint-disable testing-library/no-node-access */
const viewBox = (el) => el.querySelector("svg").getAttribute("viewBox");

// 18Test trims the bottom and right of its map, and its B10 is a right half
// 13.75 by 5.76 inches on letter paper: two pages across, one down
const PAGES = 2;

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
    expect(map.querySelectorAll(".paginated__page").length).toBe(PAGES);
  });

  it("draws a half on the map only, tiles ignore it", async () => {
    const hex = { color: "plain", half: "top" };
    const onMap = await drawSvg(<Hex hex={hex} map border />);
    expect(onMap.querySelectorAll("clipPath[id^='hexSeamClip']")).toHaveLength(
      1,
    );
    const onTile = await drawSvg(<Hex hex={hex} border />);
    expect(onTile.querySelectorAll("clipPath[id^='hexSeamClip']")).toHaveLength(
      0,
    );
    expect(
      onTile.querySelectorAll("clipPath[id^='hexBorderClip']"),
    ).toHaveLength(0);
  });
});
