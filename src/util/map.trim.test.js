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
    it("keep the top labels in the margin and move the bottom ones up", () => {
      const top = trimmed({ top: true });
      expect(top.topCoord(1)).toBe(base().topCoord(1));
      // A column that starts lower moves with the hexes, but not off the page
      expect(top.topCoord(2)).toBeGreaterThanOrEqual(10);
      const bottom = trimmed({ bottom: true });
      expect(bottom.bottomCoord(1)).toBeCloseTo(base().bottomCoord(1) - E);
      expect(bottom.topCoord(1)).toBe(base().topCoord(1));
    });

    it("follow the left and right edges", () => {
      expect(trimmed({ left: true }).leftCoord(1)).toBe(10);
      expect(trimmed({ right: true }).rightCoord(1)).toBeCloseTo(
        base().rightCoord(1) - H,
      );
    });

    it("swap with the axes on a horizontal map", () => {
      const data = trimmed({ top: true, bottom: true }, "horizontal");
      expect(data.bottomCoord(1)).toBeCloseTo(
        base("horizontal").bottomCoord(1) - 2 * H,
      );
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
