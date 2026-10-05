import hexClip from "@/util/hexClip";

const BASE =
  "-86.0252,0 -43.0126,-74.5 43.0126,-74.5 86.0252,0 43.0126,74.5 -43.0126,74.5";

describe("hexClip", () => {
  it("matches hexClipPath when no border is removed", () => {
    expect(hexClip()).toBe(BASE);
    expect(hexClip([])).toBe(BASE);
  });

  it("pushes the removed side out to apothem 75.5", () => {
    // Side 1 is the bottom edge: the two bottom vertices move to y = 75.5
    const pts = hexClip([1]).split(" ");
    expect(pts.slice(0, 4)).toEqual(BASE.split(" ").slice(0, 4));
    expect(pts[4].split(",")[1]).toBe("75.5");
    expect(pts[5].split(",")[1]).toBe("75.5");
  });

  it("pushes the top edge out for side 4", () => {
    const pts = hexClip([4]).split(" ");
    expect(pts[1].split(",")[1]).toBe("-75.5");
    expect(pts[2].split(",")[1]).toBe("-75.5");
  });

  it("handles every side", () => {
    expect(hexClip([1, 2, 3, 4, 5, 6])).not.toBe(BASE);
    expect(hexClip([6]).split(" ")).toHaveLength(6);
  });
});
