import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderApp } from "../support/helpers";

/* eslint-disable testing-library/no-node-access */
// 18Test has B10 as a right half
describe("half hexes", () => {
  it("clips a half and draws its border to the cut", async () => {
    renderApp("/games/18Test/map?print=true");
    const map = await screen.findByTestId("game-18Test-map");
    const seams = map.querySelectorAll("clipPath[id^='hexSeamClip']");
    const borders = map.querySelectorAll("clipPath[id^='hexBorderClip']");
    expect(borders.length).toBeGreaterThanOrEqual(1);
    // The right half of a pointy hex is cut corner to corner: four corners
    const cuts = [...seams].map(
      (s) =>
        s.querySelector("polygon").getAttribute("points").split(" ").length,
    );
    expect(cuts).toContain(4);
  });
});
