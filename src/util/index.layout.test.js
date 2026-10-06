import {
  fillArray,
  getCharterData,
  getFontProps,
  getTile,
  layoutPaper,
  multiDefaultTo,
  parsePrintScale,
  printableHeight,
  printableWidth,
  scalePageSize,
  titleToFilename,
} from "@/util/index";

describe("titleToFilename", () => {
  it("lowercases and dashes anything that isn't a letter or number", () => {
    expect(titleToFilename("18Test: The Game!")).toBe("18test-the-game-");
  });
});

describe("printableWidth and printableHeight", () => {
  it("subtract a single margin from both sides", () => {
    const paper = { width: 850, height: 1100, margins: 25 };
    expect(printableWidth(paper)).toBe(800);
    expect(printableHeight(paper)).toBe(1050);
  });

  it("subtract separate margins for each side", () => {
    const paper = {
      width: 850,
      height: 1100,
      margins: { left: 10, right: 20, top: 30, bottom: 40 },
    };
    expect(printableWidth(paper)).toBe(820);
    expect(printableHeight(paper)).toBe(1030);
  });
});

describe("fillArray", () => {
  it("repeats each item by its count", () => {
    expect(fillArray((a) => a.n, [{ n: 2 }, { n: 0 }, { n: 1 }])).toEqual([
      { n: 2 },
      { n: 2 },
      { n: 1 },
    ]);
  });
});

describe("getTile", () => {
  const defs = {
    1: { color: "yellow", track: [{ side: 1 }] },
    26: { color: "green" },
    57: { color: "yellow", rotations: 3 },
  };

  it("looks up a tile by id with a numeric quantity", () => {
    expect(getTile(defs, { 1: 2 }, "1")).toEqual({
      ...defs[1],
      id: "1",
      quantity: 2,
    });
  });

  it("defaults the quantity to one", () => {
    expect(getTile(defs, {}, "1").quantity).toBe(1);
  });

  it("uses the base id for variants", () => {
    expect(getTile(defs, { "26|T2": 1 }, "26|T2")).toEqual({
      color: "green",
      id: "26|T2",
      quantity: 1,
    });
  });

  it("follows aliases to other tiles", () => {
    expect(getTile(defs, { 2: { tile: "57", quantity: 2 } }, "2")).toEqual({
      ...defs[57],
      id: "2",
      quantity: 2,
    });
    expect(getTile(defs, { 9: { tile: "57|3" } }, "9")).toEqual({
      ...defs[57],
      id: "9",
      quantity: 1,
    });
  });

  it("merges partial game tiles over the definition, print over quantity", () => {
    expect(
      getTile(defs, { 1: { quantity: 2, print: 3, rotations: [0] } }, "1"),
    ).toEqual({
      ...defs[1],
      print: 3,
      rotations: [0],
      id: "1",
      quantity: 3,
    });
  });

  it("uses full tiles defined in the game", () => {
    const tile = { color: "offboard", quantity: 4 };
    expect(getTile(defs, { T1: tile }, "T1")).toEqual({
      color: "offboard",
      id: "T1",
      quantity: 4,
    });
  });
});

describe("getFontProps", () => {
  it("prefers font props over the arguments and ignores other props", () => {
    expect(
      getFontProps(
        { fontSize: 20, color: "red" },
        10,
        "normal",
        "serif",
        "italic",
      ),
    ).toEqual({
      fontFamily: "serif",
      fontSize: 20,
      fontStyle: "italic",
      fontWeight: "normal",
    });
  });
});

describe("multiDefaultTo", () => {
  it("returns the first value that isn't nil or NaN", () => {
    expect(multiDefaultTo(5, null, undefined, NaN, 0, 1)).toBe(0);
  });

  it("returns the default when every value is nil", () => {
    expect(multiDefaultTo(5, null, undefined)).toBe(5);
  });

  it("is curried on the default", () => {
    expect(multiDefaultTo(5)(null, 7)).toBe(7);
  });
});

describe("getCharterData", () => {
  const paper = { width: 850, height: 1100, margins: 25 };
  const charters = {
    layout: "free",
    halfWidth: false,
    smallerMinors: true,
    cutlines: 25,
    bleed: 12.5,
    border: 0,
  };

  it("fills the printable page for the free layout", () => {
    const data = getCharterData(charters, paper);
    expect(data).toMatchObject({
      width: 725,
      halfWidth: 325,
      height: 450,
      minorHeight: 275,
      cutlinesAndBleed: 37.5,
      bleedWidth: 750,
      bleedHeight: 475,
      bleedMinorHeight: 300,
      perPage: 2,
      minorsPerPage: 3,
      usableWidth: 800,
      usableHeight: 1050,
    });
    expect(data.css).toMatchObject({ width: "7.25in", height: "4.5in" });
  });

  it("puts two charters across with half width", () => {
    expect(
      getCharterData({ ...charters, halfWidth: true }, paper),
    ).toMatchObject({ width: 325, perPage: 4, minorsPerPage: 6 });
    expect(
      getCharterData(
        { ...charters, halfWidth: true, smallerMinors: false },
        paper,
      ),
    ).toMatchObject({ minorHeight: 450, perPage: 4, minorsPerPage: 4 });
    expect(
      getCharterData({ ...charters, smallerMinors: false }, paper),
    ).toMatchObject({ perPage: 2, minorsPerPage: 2 });
  });

  it.each([
    ["3x1", { width: 750, halfWidth: 750, perPage: 3, minorsPerPage: 3 }],
    ["3x2", { width: 375, halfWidth: 375, perPage: 6, minorsPerPage: 6 }],
    ["3x1minors", { width: 750, halfWidth: 375, perPage: 3, minorsPerPage: 6 }],
  ])("uses fixed die sizes for the %s layout", (layout, expected) => {
    const data = getCharterData({ ...charters, layout }, paper);
    expect(data).toMatchObject({
      ...expected,
      height: 333,
      minorHeight: 333,
      cutlines: 0,
      bleed: 0,
      cutlinesAndBleed: 0,
      usableWidth: 750,
      // Room for the pins
      usableHeight: 1050,
    });
  });
});

describe("parsePrintScale", () => {
  it("keeps a number in the range", () => {
    expect(parsePrintScale(100)).toBe(100);
    expect(parsePrintScale(97.5)).toBe(97.5);
    expect(parsePrintScale(50)).toBe(50);
    expect(parsePrintScale(200)).toBe(200);
  });

  it("clamps what is out of the range", () => {
    expect(parsePrintScale(10)).toBe(50);
    expect(parsePrintScale(500)).toBe(200);
  });

  it("reads a string, like the one of a url parameter", () => {
    expect(parsePrintScale("110")).toBe(110);
    expect(parsePrintScale("1000")).toBe(200);
  });

  it("is 100 when empty or not a number", () => {
    for (const value of [undefined, null, "", "big", NaN, Infinity]) {
      expect(parsePrintScale(value)).toBe(100);
    }
  });
});

describe("layoutPaper", () => {
  const paper = { width: 850, height: 1100, margins: 25 };

  it("is the same paper at 100", () => {
    expect(layoutPaper(paper)).toBe(paper);
    expect(layoutPaper(paper, 100)).toBe(paper);
    expect(layoutPaper(paper, "")).toBe(paper);
  });

  it("divides the size and the margins by the scale", () => {
    expect(layoutPaper(paper, 125)).toEqual({
      width: 680,
      height: 880,
      margins: 20,
    });
    expect(layoutPaper(paper, 50)).toEqual({
      width: 1700,
      height: 2200,
      margins: 50,
    });
  });

  it("only divides a margin that is a number", () => {
    const margins = { top: 1, right: 2, bottom: 3, left: 4 };
    expect(layoutPaper({ ...paper, margins }, 125).margins).toBe(margins);
  });

  it("does not change the paper", () => {
    layoutPaper(paper, 125);
    expect(paper).toEqual({ width: 850, height: 1100, margins: 25 });
  });
});

describe("scalePageSize", () => {
  it("is the size at 100", () => {
    expect(scalePageSize("8.51in")).toBe("8.51in");
    expect(scalePageSize("8.51in", 100)).toBe("8.51in");
  });

  it("scales the content and keeps the margins", () => {
    // 8.5in of content and 0.5in of margins
    expect(scalePageSize("9in", 110)).toBe(`${8.5 * 1.1 + 0.5}in`);
    expect(scalePageSize("9in", 50)).toBe("4.75in");
  });
});
