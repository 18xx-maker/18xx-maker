import {
  extendTo,
  firstLine,
  formatLines,
  hasLine,
  parseLines,
  toggleLine,
} from "@/util/lineSpec";

describe("parseLines", () => {
  it("reads the example of the issue", () => {
    expect(parseLines("1-4,15,16,19")).toEqual([
      [1, 4],
      [15, 16],
      [19, 19],
    ]);
  });

  it("swaps reversed ranges and merges duplicates and neighbours", () => {
    expect(parseLines("4-1")).toEqual([[1, 4]]);
    expect(parseLines("3,3,2-5,6")).toEqual([[2, 6]]);
    expect(formatLines(parseLines("16,15,1-4,19"))).toBe("1-4,15-16,19");
  });

  it("ignores junk, zero and negative lines", () => {
    expect(parseLines("a,,1-,-3,0,x-y,2.5,7")).toEqual([[7, 7]]);
    expect(parseLines("0-3")).toEqual([[1, 3]]);
    expect(parseLines("0")).toEqual([]);
    expect(parseLines(undefined)).toEqual([]);
    expect(parseLines(null)).toEqual([]);
  });

  it("stops at 200 tokens", () => {
    const spec = Array.from({ length: 300 }, (_, i) => i * 2 + 2).join(",");
    expect(parseLines(spec)).toHaveLength(200);
  });
});

describe("lines", () => {
  it("toggles a line in and out of a range", () => {
    expect(toggleLine([], 5)).toEqual([[5, 5]]);
    expect(toggleLine([[2, 6]], 4)).toEqual([
      [2, 3],
      [5, 6],
    ]);
    expect(toggleLine([[2, 6]], 2)).toEqual([[3, 6]]);
    expect(toggleLine([[5, 5]], 5)).toEqual([]);
    expect(toggleLine([[2, 3]], 4)).toEqual([[2, 4]]);
  });

  it("extends from the first selected line, or the line itself", () => {
    expect(extendTo([], 7)).toEqual([[7, 7]]);
    expect(extendTo([[3, 4]], 9)).toEqual([[3, 9]]);
    expect(extendTo([[5, 6]], 2)).toEqual([[2, 5]]);
    expect(
      extendTo(
        [
          [3, 4],
          [20, 21],
        ],
        9,
      ),
    ).toEqual([[3, 9]]);
  });

  it("adds the range to the set", () => {
    expect(
      extendTo(
        [
          [3, 4],
          [20, 21],
        ],
        9,
        true,
      ),
    ).toEqual([
      [3, 9],
      [20, 21],
    ]);
  });

  it("finds lines", () => {
    expect(firstLine([])).toBeUndefined();
    expect(firstLine([[4, 6]])).toBe(4);
    expect(hasLine([[4, 6]], 5)).toBe(true);
    expect(hasLine([[4, 6]], 7)).toBe(false);
  });
});
