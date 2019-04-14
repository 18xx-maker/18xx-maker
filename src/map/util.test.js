import * as util from "./util";

describe("maxMapX", () => {
  it("should handle empty lists", () => {
    expect(util.maxMapX([])).toEqual(1);
  });

  it("should handle empty hexes", () => {
    expect(util.maxMapX([{ hexes: [] }])).toEqual(1);
  });

  it("should handle single hexes", () => {
    expect(util.maxMapX([{ hexes: [[5, 4]] }])).toEqual(5);
  });

  it("should handle double hexes", () => {
    expect(util.maxMapX([{ hexes: [[5, 4], [10, 3]] }])).toEqual(10);
  });

  it("should handle multiple double hexes", () => {
    expect(
      util.maxMapX([{ hexes: [[6, 5], [15, 7]] }, { hexes: [[5, 4], [10, 3]] }])
    ).toEqual(15);
  });
});

describe("maxMapY", () => {
  it("should handle empty lists", () => {
    expect(util.maxMapY([])).toEqual(1);
  });

  it("should handle empty hexes", () => {
    expect(util.maxMapY([{ hexes: [] }])).toEqual(1);
  });

  it("should handle single hexes", () => {
    expect(util.maxMapY([{ hexes: [[5, 4]] }])).toEqual(4);
  });

  it("should handle double hexes", () => {
    expect(util.maxMapY([{ hexes: [[5, 4], [10, 3]] }])).toEqual(4);
  });

  it("should handle multiple double hexes", () => {
    expect(
      util.maxMapY([{ hexes: [[6, 5], [15, 7]] }, { hexes: [[5, 4], [10, 3]] }])
    ).toEqual(7);
  });
});

describe("toAlpha", () => {
  it("should handle negatives", () => {
    expect(util.toAlpha(-1)).toEqual("");
    expect(util.toAlpha(-27)).toEqual("");
  });

  it("should handle zero", () => {
    expect(util.toAlpha(0)).toEqual("");
  });

  it("should handle low numbers", () => {
    expect(util.toAlpha(1)).toEqual("A");
    expect(util.toAlpha(4)).toEqual("D");
  });

  it("should handle slightly larger numbers", () => {
    expect(util.toAlpha(27)).toEqual("AA");
    expect(util.toAlpha(30)).toEqual("AD");
    expect(util.toAlpha(51)).toEqual("AY");
    expect(util.toAlpha(52)).toEqual("AZ");
    expect(util.toAlpha(53)).toEqual("BA");
    expect(util.toAlpha(54)).toEqual("BB");
  });
});

describe("toCoords", () => {
  it("should handle simple coords", () => {
    expect(util.toCoords("D4")).toEqual([4, 4]);
    expect(util.toCoords("E17")).toEqual([17, 5]);
  });

  it("should handle large coords", () => {
    expect(util.toCoords("AA4")).toEqual([4, 27]);
    expect(util.toCoords("AD17")).toEqual([17, 30]);
    expect(util.toCoords("AY1")).toEqual([1, 51]);
    expect(util.toCoords("AZ1")).toEqual([1, 52]);
    expect(util.toCoords("BA1")).toEqual([1, 53]);
    expect(util.toCoords("BB1")).toEqual([1, 54]);
  });
});

describe("mergeHex", () => {
  it("should handle simple stuff", () => {
    let hex = { copy: "A5" };
    let copyHex = { color: "yellow" };
    expect(util.mergeHex(hex, copyHex)).toEqual({
      copy: "A5",
      color: "yellow"
    });
  });

  it("should merge track", () => {
    let hex = {
      copy: "A5",
      track: [
        {
          side: 3
        }
      ]
    };
    let copyHex = {
      color: "yellow",
      track: [
        {
          side: 4
        }
      ]
    };
    expect(util.mergeHex(hex, copyHex)).toEqual({
      copy: "A5",
      color: "yellow",
      track: [
        {
          side: 3
        },
        {
          side: 4
        }
      ]
    });
  });

  it("should handle cities", () => {
    let hex = {
      copy: "A5",
      cities: [
        {
          name: {
            name: "Original1"
          }
        },
        {
          name: {
            name: "Original2"
          }
        }
      ]
    };
    let copyHex = {
      color: "yellow",
      cities: [
        {
          x: 5,
          y: 10,
          name: {
            name: "Copy1"
          }
        },
        {
          x: 6,
          y: 11,
          name: {
            name: "Copy2"
          }
        }
      ]
    };
    expect(util.mergeHex(hex, copyHex)).toEqual({
      copy: "A5",
      color: "yellow",
      cities: [
        {
          x: 5,
          y: 10,
          name: {
            name: "Original1"
          }
        },
        {
          x: 6,
          y: 11,
          name: {
            name: "Original2"
          }
        }
      ]
    });
  });
});
