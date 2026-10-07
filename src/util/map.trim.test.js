import { getMapData } from "@/util/map";

// [x, y]: A1 [1,1], A3 [3,1], B2 [2,2], C1 [1,3]
const game = (trim, orientation, extra = {}) => ({
  info: { orientation },
  map: { trim, hexes: [{ hexes: ["A1", "A3", "B2", "C1"] }], ...extra },
});
const W = 100;
const E = 100 * 0.57735;
const H = 50;
const base = (orientation) =>
  getMapData(game(undefined, orientation), "edge", W);
const trimmed = (trim, orientation) =>
  getMapData(game(trim, orientation), "edge", W);

describe("getMapData trim", () => {
  it("changes nothing without a trim", () => {
    const data = trimmed({});
    expect(data.totalWidth).toBe(base().totalWidth);
    expect(data.trimHalves(1, 1)).toEqual([]);
  });

  it("removes half a hex height for the top and bottom", () => {
    const [top, bottom] = [trimmed({ top: true }), trimmed({ bottom: true })];
    expect(top.totalHeight).toBeCloseTo(base().totalHeight - E);
    expect(bottom.totalHeight).toBeCloseTo(base().totalHeight - E);
    expect(top.totalWidth).toBe(base().totalWidth);
    // Only the top moves the hexes
    expect(top.hexY(1, 1)).toBeCloseTo(base().hexY(1, 1) - E);
    expect(bottom.hexY(1, 1)).toBe(base().hexY(1, 1));
  });

  it("removes half a hex width for the left and right", () => {
    const [left, right] = [trimmed({ left: true }), trimmed({ right: true })];
    expect(left.totalWidth).toBeCloseTo(base().totalWidth - H);
    expect(right.totalWidth).toBeCloseTo(base().totalWidth - H);
    expect(left.totalHeight).toBe(base().totalHeight);
    expect(left.hexX(1, 1)).toBeCloseTo(base().hexX(1, 1) - H);
    expect(right.hexX(1, 1)).toBe(base().hexX(1, 1));
  });

  it("trims every edge together", () => {
    const all = trimmed({ top: true, bottom: true, left: true, right: true });
    expect(all.totalHeight).toBeCloseTo(base().totalHeight - 2 * E);
    expect(all.totalWidth).toBeCloseTo(base().totalWidth - 2 * H);
  });

  it("follows the page edges on a horizontal map", () => {
    const top = trimmed({ top: true }, "horizontal");
    const left = trimmed({ left: true }, "horizontal");
    // The top of a horizontal page is half a column, not half a row
    expect(top.totalHeight).toBeCloseTo(base("horizontal").totalHeight - H);
    expect(top.totalWidth).toBe(base("horizontal").totalWidth);
    expect(top.hexY(1, 1)).toBeCloseTo(base("horizontal").hexY(1, 1) - H);
    expect(left.totalWidth).toBeCloseTo(base("horizontal").totalWidth - E);
    expect(left.hexX(1, 1)).toBeCloseTo(base("horizontal").hexX(1, 1) - E);
  });

  it("keeps the extra total size", () => {
    const withExtra = getMapData(
      { ...game({ top: true }), info: { extraTotalHeight: 150 } },
      "edge",
      W,
    );
    const plain = getMapData(
      { ...game(), info: { extraTotalHeight: 150 } },
      "edge",
      W,
    );
    expect(withExtra.totalHeight).toBeCloseTo(plain.totalHeight - E);
  });

  describe("coordinates", () => {
    const BIG = ["A1", "A3", "A5", "B2", "B4", "C1", "C3", "C5"];
    const big = (trim, orientation) =>
      getMapData(
        {
          info: { orientation },
          map: { trim, hexes: [{ hexes: BIG }] },
        },
        "edge",
        W,
      );

    it("keep the top labels in the margin", () => {
      const top = trimmed({ top: true });
      expect(top.topCoord(1)).toBe(base().topCoord(1));
      // A column that starts lower moves with the hexes, but not off the page
      expect(top.topCoord(2)).toBeGreaterThanOrEqual(10);
      expect(trimmed({ bottom: true }).topCoord(1)).toBe(base().topCoord(1));
    });

    it("keep the bottom labels with the hexes, on the page", () => {
      // The hexes move up by the top trim only, the bottom label follows them
      const top = big({ top: true });
      expect(top.bottomCoord(2)).toBeCloseTo(
        Math.min(big().bottomCoord(2) - E, top.totalHeight - 10),
      );
      expect(top.bottomCoord(2)).toBeCloseTo(big().bottomCoord(2) - E);
      // A trimmed bottom does not move the hexes of a column that is not cut
      const bottom = big({ bottom: true });
      expect(bottom.bottomCoord(2)).toBeCloseTo(
        Math.min(big().bottomCoord(2), bottom.totalHeight - 10),
      );
      expect(bottom.bottomCoord(1)).toBeLessThanOrEqual(
        bottom.totalHeight - 10,
      );
    });

    it("keep the right labels with the hexes, on the page", () => {
      const left = big({ left: true });
      expect(left.rightCoord(2)).toBeCloseTo(big().rightCoord(2) - H);
      const right = big({ right: true });
      expect(right.rightCoord(2)).toBeCloseTo(
        Math.min(big().rightCoord(2), right.totalWidth - 10),
      );
      expect(right.rightCoord(1)).toBeLessThanOrEqual(right.totalWidth - 10);
      expect(trimmed({ left: true }).leftCoord(1)).toBe(10);
    });

    it("swap with the axes on a horizontal map", () => {
      const data = big({ top: true, bottom: true, right: true }, "horizontal");
      const plain = big(undefined, "horizontal");
      // The top of the page is the first column: the labels at the bottom
      // follow the hexes, which moved by it, and stay on the page
      expect(data.bottomCoord(2)).toBeCloseTo(
        Math.min(plain.bottomCoord(2) - H, data.totalHeight - 10),
      );
      expect(data.rightCoord(2)).toBeCloseTo(
        Math.min(plain.rightCoord(2), data.totalWidth - 10),
      );
    });

    it("do not change for a map that is not trimmed", () => {
      // A hex in column 0 puts the left label before the page
      const plain = getMapData(
        { info: {}, map: { hexes: [{ hexes: ["A0", "B1"] }] } },
        "edge",
        W,
      );
      expect(plain.leftCoord(1)).toBe(10 + H * (0 - 1));
    });
  });

  describe("trimHalves", () => {
    it("halves the outermost row and column", () => {
      const data = trimmed({
        top: true,
        bottom: true,
        left: true,
        right: true,
      });
      expect(data.trimHalves(1, 1)).toEqual(["bottom", "right"]);
      expect(data.trimHalves(3, 1)).toEqual(["bottom", "left"]);
      expect(data.trimHalves(1, 3)).toEqual(["top", "right"]);
      // Inside the map nothing is cut
      expect(data.trimHalves(2, 2)).toEqual([]);
    });

    it("only cuts the outermost column of a staggered layout", () => {
      const data = trimmed({ left: true });
      expect(data.trimHalves(1, 3)).toEqual(["right"]);
      expect(data.trimHalves(2, 2)).toEqual([]);
    });

    it("names the page side on a horizontal map", () => {
      // The top of the page is the first column of the coordinates
      const data = trimmed({ top: true, left: true }, "horizontal");
      expect(data.trimHalves(1, 2)).toEqual(["bottom"]);
      expect(data.trimHalves(2, 1)).toEqual(["right"]);
    });
  });

  describe("a map that starts at a later row and column", () => {
    const late = (trim) =>
      getMapData(
        { info: {}, map: { trim, hexes: [{ hexes: ["B4", "C5"] }] } },
        "edge",
        W,
      );

    it("cuts the first row and column of the hexes", () => {
      const data = late({ top: true, left: true });
      expect(data.trimHalves(4, 2)).toEqual(["bottom", "right"]);
      expect(data.trimHalves(5, 3)).toEqual([]);
    });

    it("moves the hexes to the cut", () => {
      const plain = late({});
      const data = late({ top: true, left: true });
      expect(data.hexY(4, 2)).toBeCloseTo(data.coordOffset);
      expect(data.hexX(4, 2)).toBeCloseTo(data.coordOffset + 4 * H - 4 * H);
      expect(data.totalHeight).toBeCloseTo(plain.totalHeight - (1.5 * E + E));
      expect(data.totalWidth).toBeCloseTo(plain.totalWidth - 4 * H);
    });
  });

  describe("a map that copies another", () => {
    const copy = (trim) => ({
      info: {},
      map: [
        { trim: { top: true, left: true }, hexes: [{ hexes: ["A1", "B2"] }] },
        { copy: 0, trim },
      ],
    });
    const height = (trim) => getMapData(copy(trim), "edge", W, 1).totalHeight;

    it("keeps the trim of the copied map", () => {
      const data = getMapData(copy(undefined), "edge", W, 1);
      expect(data.trimHalves(1, 1)).toEqual(["bottom", "right"]);
    });

    it("can set an edge again or put it back", () => {
      const data = getMapData(copy({ top: false, right: true }), "edge", W, 1);
      expect(data.trimHalves(1, 1)).toEqual(["right"]);
      expect(data.trimHalves(2, 2)).toEqual(["left"]);
      expect(height({ top: false })).toBeCloseTo(height({ top: true }) + E);
    });
  });
});
