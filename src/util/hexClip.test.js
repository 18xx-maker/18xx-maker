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

const pts = (s) => s.split(" ").map((p) => p.split(",").map(Number));
const bounds = (s) => {
  const p = pts(s);
  const xs = p.map((q) => q[0]);
  const ys = p.map((q) => q[1]);
  return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
};

describe("hexClip halves", () => {
  it("is the whole hex without halves", () => {
    expect(hexClip([], [], 90)).toBe(BASE);
  });

  describe("flat top hex (horizontal map, no rotation)", () => {
    it("top cuts vertex to vertex", () => {
      const p = pts(hexClip([], ["top"]));
      expect(p).toHaveLength(4);
      expect(bounds(hexClip([], ["top"]))).toEqual([
        -86.0252, 86.0252, -74.5, 0,
      ]);
    });

    it("bottom keeps the lower half", () => {
      expect(bounds(hexClip([], ["bottom"]))).toEqual([
        -86.0252, 86.0252, 0, 74.5,
      ]);
    });

    it("left and right cut through the middle of the flats", () => {
      const l = pts(hexClip([], ["left"]));
      expect(l).toHaveLength(5);
      expect(bounds(hexClip([], ["left"]))).toEqual([-86.0252, 0, -74.5, 74.5]);
      expect(bounds(hexClip([], ["right"]))).toEqual([0, 86.0252, -74.5, 74.5]);
    });
  });

  describe("pointy top hex (rotation 90)", () => {
    it("left and right cut vertex to vertex in the page", () => {
      // Page left is the local bottom
      expect(bounds(hexClip([], ["left"], 90))).toEqual(
        bounds(hexClip([], ["bottom"], 0)),
      );
      expect(bounds(hexClip([], ["right"], 90))).toEqual(
        bounds(hexClip([], ["top"], 0)),
      );
    });

    it("top and bottom cut through the middle of the sides", () => {
      expect(pts(hexClip([], ["top"], 90))).toHaveLength(5);
      expect(bounds(hexClip([], ["top"], 90))).toEqual(
        bounds(hexClip([], ["left"], 0)),
      );
      expect(bounds(hexClip([], ["bottom"], 90))).toEqual(
        bounds(hexClip([], ["right"], 0)),
      );
    });
  });

  it("intersects two halves into a quarter", () => {
    expect(bounds(hexClip([], ["top", "left"]))).toEqual([
      -86.0252, 0, -74.5, 0,
    ]);
  });

  it("combines with removed borders", () => {
    // Side 4 is the top edge, pushed out to 75.5, and the bottom half is cut
    const b = bounds(hexClip([4], ["top"]));
    expect(b[2]).toBe(-75.5);
    expect(b[3]).toBe(0);
    expect(bounds(hexClip([1], ["top"]))[2]).toBe(-74.5);
  });
});
