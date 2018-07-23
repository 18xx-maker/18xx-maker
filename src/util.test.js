import util from "./util";

describe("trackType", () => {
  it("should identify city tiles", () => {
    expect(util.trackType({ start: 1 })).toEqual("city");
  });

  it("should handle simple tiles", () => {
    expect(util.trackType({ start: 1, end: 2 })).toEqual("sharp");
    expect(util.trackType({ start: 1, end: 3 })).toEqual("gentle");
    expect(util.trackType({ start: 1, end: 4 })).toEqual("straight");
  });

  it("should handle reverse tiles", () => {
    expect(util.trackType({ start: 2, end: 1 })).toEqual("sharp");
    expect(util.trackType({ start: 3, end: 1 })).toEqual("gentle");
    expect(util.trackType({ start: 4, end: 1 })).toEqual("straight");
  });

  it("should handle looping tiles", () => {
    expect(util.trackType({ start: 6, end: 1 })).toEqual("sharp");
    expect(util.trackType({ start: 6, end: 2 })).toEqual("gentle");
    expect(util.trackType({ start: 6, end: 3 })).toEqual("straight");
  });

  it("should handle reverse looping tiles", () => {
    expect(util.trackType({ start: 1, end: 6 })).toEqual("sharp");
    expect(util.trackType({ start: 2, end: 6 })).toEqual("gentle");
    expect(util.trackType({ start: 3, end: 6 })).toEqual("straight");
  });
});

describe("pages", () => {
  it("handle < single pages", () => {
    expect(util.pages(90, 100)).toEqual([90]);
  });

  it("handle single pages", () => {
    expect(util.pages(100, 100)).toEqual([100]);
  });

  it("handle < double pages", () => {
    expect(util.pages(190, 100)).toEqual([95,95]);
  });

  it("handle double pages", () => {
    expect(util.pages(200, 100)).toEqual([100,100]);
  });

  it("handle > double pages", () => {
    expect(util.pages(210, 100)).toEqual([55,100,55]);
  });

  it("handle triple pages", () => {
    expect(util.pages(300, 100)).toEqual([100,100,100]);
  });
});

describe("marketColor", () => {
  it("should handle empty lists", () => {
    expect(util.marketColor([], 20)).toEqual("plain");
  });

  it("should handle multiple limits", () => {
    let limits = [
      {
        color: "yellow",
        value: 60
      },
      {
        color: "orange",
        value: 45
      },
      {
        color: "brown",
        value: 30
      }
    ];
    expect(util.marketColor(limits, 80)).toEqual("plain");
    expect(util.marketColor(limits, 60)).toEqual("yellow");
    expect(util.marketColor(limits, 40)).toEqual("orange");
    expect(util.marketColor(limits, 29)).toEqual("brown");
  });
});

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
  });
});

describe("toCoords", () => {
  it("should handle simple coords", () => {
    expect(util.toCoords("D4")).toEqual([4, 4]);
    expect(util.toCoords("E17")).toEqual([17, 5]);
  });

  it("should handle simple coords", () => {
    expect(util.toCoords("AA4")).toEqual([4, 27]);
    expect(util.toCoords("AD17")).toEqual([17, 30]);
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
