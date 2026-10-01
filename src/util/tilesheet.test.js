import defaults from "@/defaults.json";
import { HEX_RATIO } from "@/util/map";
import { getTileSheetContext } from "@/util/tilesheet";

const { paper } = defaults;
const layouts = ["die", "smallDie", "individual", "offset"];

describe("getTileSheetContext", () => {
  it("should compute tile size from the hex width", () => {
    const c = getTileSheetContext("individual", paper, 150);

    expect(c.height).toBe(150);
    expect(c.width).toBeCloseTo(150 * HEX_RATIO * 2);
    expect(c.bleedHeight).toBe(170);
    expect(c.bleedWidth).toBeCloseTo(170 * HEX_RATIO * 2);
  });

  it("should use the printable area of the paper", () => {
    const c = getTileSheetContext("individual", paper, 150);

    expect(c.pageWidth).toBe(800);
    expect(c.pageHeight).toBe(1050);
  });

  it("should hardcode the hex width for die layouts", () => {
    expect(getTileSheetContext("die", paper, 99).hexWidth).toBe(150);
    expect(getTileSheetContext("smallDie", paper, 99).hexWidth).toBe(106.25);
    expect(getTileSheetContext("individual", paper, 99).hexWidth).toBe(99);
  });

  it("should fit the expected tiles per page for each layout", () => {
    const counts = Object.fromEntries(
      layouts.map((layout) => {
        const c = getTileSheetContext(layout, paper, 150);
        return [layout, [c.perRow, c.rowsPerPage, c.perPage]];
      }),
    );

    expect(counts).toEqual({
      die: [4, 6, 24],
      smallDie: [7, 9, 60],
      individual: [4, 6, 24],
      offset: [4, 6, 24],
    });
  });

  it("should use the clip path for the layout", () => {
    const clip = (layout) => getTileSheetContext(layout, paper, 150).clipPath;

    expect(clip("die")).toBe("hexBleedClipPath");
    expect(clip("smallDie")).toBe("hexBleedClipPath");
    expect(clip("individual")).toBe("hexClipPath");
    expect(clip("offset")).toBe("hexBleedClipPathOffset");
  });

  it("should fill die columns top to bottom", () => {
    const c = getTileSheetContext("die", paper, 150);

    expect([0, 1, 5, 6, 12].map(c.getXindex)).toEqual([0, 0, 0, 1, 2]);
    expect([0, 1, 5, 6, 12].map(c.getYindex)).toEqual([0, 1, 5, 0, 0]);

    // Columns are a tile width and a quarter inch apart, rows a tile height
    expect(c.getX(6) - c.getX(0)).toBeCloseTo(c.width + 25);
    expect(c.getY(1) - c.getY(0)).toBeCloseTo(150);
    expect(c.getY(0)).toBeCloseTo(75 + 62.5);
  });

  it("should space the individual layout evenly", () => {
    const c = getTileSheetContext("individual", paper, 150);

    expect(c.getX(1) - c.getX(0)).toBeCloseTo(c.width + 12.5);
    expect(c.getY(c.perRow) - c.getY(0)).toBeCloseTo(150 + 12.5);
  });

  it("should shift odd rows of the offset layout by half a tile", () => {
    const c = getTileSheetContext("offset", paper, 150);

    expect(c.isOdd(0)).toBe(false);
    expect(c.isOdd(c.perRow)).toBe(true);
    expect(c.getX(c.perRow) - c.getX(0)).toBeCloseTo(c.width / 2);
    expect(c.getX(c.perRow * 2)).toBeCloseTo(c.getX(0));
  });

  it("should interleave the columns of the small die", () => {
    const c = getTileSheetContext("smallDie", paper, 150);

    // 17 tiles per pair of columns, 9 in the first column, 8 in the next
    expect([0, 8, 9, 16, 17].map(c.getXindex)).toEqual([0, 0, 1, 1, 2]);
    expect([0, 8, 9, 16, 17].map(c.getYindex)).toEqual([0, 8, 0, 7, 0]);

    // Odd columns are dropped half a tile
    expect(c.getY(9) - c.getY(0)).toBeCloseTo(c.height / 2);
    expect(c.getY(17)).toBeCloseTo(c.getY(0));
  });

  it.each(layouts)(
    "should never place two tiles on top of each other (%s)",
    (layout) => {
      const c = getTileSheetContext(layout, paper, 150);
      const spots = new Set();
      for (let n = 0; n < c.perPage; n++) {
        spots.add(`${c.getX(n).toFixed(2)},${c.getY(n).toFixed(2)}`);
      }

      expect(spots.size).toBe(c.perPage);
    },
  );

  it.each(["die", "individual", "offset"])(
    "should keep every tile on the page (%s)",
    (layout) => {
      const c = getTileSheetContext(layout, paper, 150);
      for (let n = 0; n < c.perPage; n++) {
        expect(c.getX(n) - c.width / 2).toBeGreaterThanOrEqual(0);
        expect(c.getX(n) + c.width / 2).toBeLessThanOrEqual(c.pageWidth);
        expect(c.getY(n) - c.height / 2).toBeGreaterThanOrEqual(0);
        expect(c.getY(n) + c.height / 2).toBeLessThanOrEqual(c.pageHeight);
      }
    },
  );
});
