import { describe, expect, it } from "vitest";

import Title from "@/components/map/Title";

import { all, drawSvg, withInfo } from "@tests/support/render.jsx";

// A field that was renamed keeps working under its old name, renders the same
// as the new name, and the new name wins when a game has both.

const sizes = async (info) => {
  const svg = await drawSvg(<Title game={withInfo(info)} hexWidth={150} />);
  return all(svg, "text").map((t) => t.getAttribute("font-size"));
};

describe("renamed info font sizes", () => {
  it.each([
    ["titleSize", "titleFontSize", 0],
    ["subtitleSize", "subtitleFontSize", 1],
    ["designerSize", "designerFontSize", 2],
  ])("%s renders the same as %s", async (old, current, index) => {
    const base = { subtitle: "Sub", designer: "Des" };
    const viaOld = await sizes({ ...base, [old]: 77 });
    const viaNew = await sizes({ ...base, [current]: 77 });
    expect(viaOld).toEqual(viaNew);
    expect(viaNew[index]).toBe("77");
    expect(viaNew[(index + 1) % 3]).not.toBe("77");
  });

  it.each([
    ["titleSize", "titleFontSize", 0],
    ["subtitleSize", "subtitleFontSize", 1],
    ["designerSize", "designerFontSize", 2],
  ])("%s loses to %s when both are set", async (old, current, index) => {
    const base = { subtitle: "Sub", designer: "Des" };
    const both = await sizes({ ...base, [old]: 55, [current]: 66 });
    expect(both[index]).toBe("66");
  });

  it.each([
    ["titleSize", "titleFontSize", 0],
    ["subtitleSize", "subtitleFontSize", 1],
    ["designerSize", "designerFontSize", 2],
  ])("%s and %s accept 0", async (old, current, index) => {
    const base = { subtitle: "Sub", designer: "Des" };
    expect((await sizes({ ...base, [current]: 0 }))[index]).toBe("0");
    expect((await sizes({ ...base, [old]: 0 }))[index]).toBe("0");
    // A 0 of the new name does not fall through to the old name
    expect((await sizes({ ...base, [old]: 9, [current]: 0 }))[index]).toBe("0");
  });
});
