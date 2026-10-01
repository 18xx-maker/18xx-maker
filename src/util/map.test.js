import games from "@/data/games";
import * as util from "@/util/map";

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
    expect(
      util.maxMapX([
        {
          hexes: [
            [5, 4],
            [10, 3],
          ],
        },
      ]),
    ).toEqual(10);
  });

  it("should handle multiple double hexes", () => {
    expect(
      util.maxMapX([
        {
          hexes: [
            [6, 5],
            [15, 7],
          ],
        },
        {
          hexes: [
            [5, 4],
            [10, 3],
          ],
        },
      ]),
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
    expect(
      util.maxMapY([
        {
          hexes: [
            [5, 4],
            [10, 3],
          ],
        },
      ]),
    ).toEqual(4);
  });

  it("should handle multiple double hexes", () => {
    expect(
      util.maxMapY([
        {
          hexes: [
            [6, 5],
            [15, 7],
          ],
        },
        {
          hexes: [
            [5, 4],
            [10, 3],
          ],
        },
      ]),
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
      color: "yellow",
    });
  });

  it("should merge track", () => {
    let hex = {
      copy: "A5",
      track: [
        {
          side: 3,
        },
      ],
    };
    let copyHex = {
      color: "yellow",
      track: [
        {
          side: 4,
        },
      ],
    };
    expect(util.mergeHex(hex, copyHex)).toEqual({
      copy: "A5",
      color: "yellow",
      track: [
        {
          side: 3,
        },
        {
          side: 4,
        },
      ],
    });
  });

  it("should handle cities", () => {
    let hex = {
      copy: "A5",
      cities: [
        {
          name: {
            name: "Original1",
          },
        },
        {
          name: {
            name: "Original2",
          },
        },
      ],
    };
    let copyHex = {
      color: "yellow",
      cities: [
        {
          x: 5,
          y: 10,
          name: {
            name: "Copy1",
          },
        },
        {
          x: 6,
          y: 11,
          name: {
            name: "Copy2",
          },
        },
      ],
    };
    expect(util.mergeHex(hex, copyHex)).toEqual({
      copy: "A5",
      color: "yellow",
      cities: [
        {
          x: 5,
          y: 10,
          name: {
            name: "Original1",
          },
        },
        {
          x: 6,
          y: 11,
          name: {
            name: "Original2",
          },
        },
      ],
    });
  });
});

describe("getCoordSpace and getCoordOffset", () => {
  it("should reserve room for the chosen coordinates", () => {
    expect(util.getCoordSpace("outside")).toBe(100);
    expect(util.getCoordSpace("edge")).toBe(50);
    expect(util.getCoordSpace("none")).toBe(0);
    expect(util.getCoordOffset("outside")).toBe(50);
    expect(util.getCoordOffset("edge")).toBe(25);
    expect(util.getCoordOffset(undefined)).toBe(0);
  });
});

describe("getTotalWidth and getTotalHeight", () => {
  it("should size by hex counts", () => {
    // 18 half hex widths plus 100 of coordinates
    expect(util.getTotalWidth(17, 150, 0, 100)).toBe(1450);
    expect(util.getTotalHeight(2, 150, 0, 100)).toBeCloseTo(
      100 + 1.5 * util.HEX_RATIO * 150 + 2 * util.HEX_RATIO * 150,
    );
  });

  it("should scale extra size with the hex width", () => {
    expect(util.getTotalWidth(1, 75, 10, 0)).toBe(5 + 75);
    expect(util.getTotalHeight(1, 300, 20, 0)).toBeCloseTo(
      40 + 2 * util.HEX_RATIO * 300,
    );
  });
});

describe("getMapHexes", () => {
  const hexes = (...coords) => ({ hexes: coords });

  it("should return nothing for a map-less game", () => {
    expect(util.getMapHexes({})).toEqual([]);
  });

  it("should tag hexes with their variation", () => {
    const game = { map: [{ hexes: [hexes("A1")] }, { hexes: [hexes("B2")] }] };

    expect(util.getMapHexes(game, 1)).toEqual([
      { hexes: ["B2"], variation: 1 },
    ]);
    expect(util.getMapHexes(game)[0].variation).toBe(0);
  });

  it("should put copied hexes before the new ones", () => {
    const game = {
      map: [{ hexes: [hexes("A1")] }, { copy: 0, hexes: [hexes("B2")] }],
    };
    const result = util.getMapHexes(game, 1);

    expect(result.map((h) => [h.hexes[0], h.variation])).toEqual([
      ["A1", 0],
      ["B2", 1],
    ]);
  });

  it("should resolve a hex copying another hex", () => {
    const game = {
      map: {
        hexes: [
          {
            color: "yellow",
            track: [{ type: "straight", side: 1 }],
            hexes: ["A1"],
          },
          { copy: "A1", track: [{ type: "straight", side: 2 }], hexes: ["A3"] },
        ],
      },
    };
    const [, copied] = util.getMapHexes(game);

    expect(copied.color).toBe("yellow");
    expect(copied.hexes).toEqual(["A3"]);
    expect(copied.copy).toBeUndefined();
    expect(copied.track).toHaveLength(2);
  });
});

describe("getMapHex", () => {
  it("should find the hex definition for a coordinate", () => {
    const game = {
      map: {
        hexes: [{ hexes: ["A1", "A3"] }, { color: "red", hexes: ["B2"] }],
      },
    };

    expect(util.getMapHex(game, "B2").color).toBe("red");
    expect(util.getMapHex(game, "A3").hexes).toEqual(["A1", "A3"]);
    expect(util.getMapHex(game, "Z9")).toBeUndefined();
  });
});

describe("getMapData", () => {
  it("should return nothing for a map-less game", () => {
    expect(util.getMapData({ info: {} }, "outside", 150)).toEqual({});
  });

  describe("18Test (pointy hexes)", () => {
    const data = util.getMapData(games["18Test"], "outside", 150);

    it("should compute the size of the map", () => {
      // Hexes run A11 to B16 and the title hex A17: x up to 17, y up to 2
      expect([data.maxX, data.maxY]).toEqual([17, 2]);
      expect(data.horizontal).toBe(false);
      expect(data.totalWidth).toBe(1450);
      expect(data.totalHeight).toBeCloseTo(403.1, 1);
      expect(data.humanWidth).toBe("15in");
      expect(data.humanHeight).toBe("5in");
      expect(data.printWidth).toBe("15.02in");
    });

    it("should place hexes on the grid", () => {
      expect(data.hexX(11, 1)).toBe(11 * 75 + 50);
      expect(data.hexY(11, 1)).toBeCloseTo(50 + 150 * util.HEX_RATIO);
      // A row down is 1.5 edges lower
      expect(data.hexY(12, 2) - data.hexY(11, 1)).toBeCloseTo(
        1.5 * 150 * util.HEX_RATIO,
      );
    });

    it("should resolve the hexes", () => {
      expect(data.hexes).toHaveLength(games["18Test"].map.hexes.length);
      expect(data.a1Valid).toBe(true);
    });

    it("should have a smaller map at a smaller hex width", () => {
      const small = util.getMapData(games["18Test"], "outside", 75);

      expect(small.scale).toBe(0.5);
      expect(small.totalWidth).toBe(100 + 37.5 * 18);
    });
  });

  describe("1889 (horizontal hexes)", () => {
    const flat = util.getMapData(games["1889"], "outside", 150);

    it("should swap the axes", () => {
      expect(flat.horizontal).toBe(true);
      expect(flat.maxX).toBe(util.maxMapY(flat.hexes));
      expect(flat.maxY).toBe(util.maxMapX(flat.hexes));
    });

    const pointy = util.getMapData(
      { ...games["1889"], info: { ...games["1889"].info, orientation: "" } },
      "outside",
      150,
    );

    it("should swap the hex positions", () => {
      expect(flat.hexX(2, 3)).toBe(pointy.hexY(2, 3));
      expect(flat.hexY(2, 3)).toBe(pointy.hexX(2, 3));
      expect(flat.hexX(2, 3)).not.toBe(flat.hexY(2, 3));
    });

    it("should swap the print size", () => {
      expect(flat.totalWidth).toBe(pointy.totalHeight);
      expect(flat.totalHeight).toBe(pointy.totalWidth);
      expect(flat.printWidth).toBe(pointy.printHeight);
    });
  });

  it("should merge a copied variation", () => {
    const game = {
      info: {},
      map: [
        {
          hexes: [{ hexes: ["A1", "A3"] }],
          borders: [{ id: 1 }, { id: 2 }],
          borderTexts: [{ text: "a" }],
          lines: [{ id: "l1" }],
        },
        {
          copy: 0,
          remove: ["A3"],
          removeBorders: [{ id: 1 }],
          hexes: [{ hexes: ["B2"] }],
          borders: [{ id: 3 }],
          borderTexts: [{ text: "b" }],
          lines: [{ id: "l2" }],
        },
      ],
    };
    const data = util.getMapData(game, "none", 150, 1);

    expect(data.hexes.map((h) => h.hexes)).toEqual([["A1"], ["B2"]]);
    expect(data.borders).toEqual([{ id: 2 }, { id: 3 }]);
    // The copied map comes first
    expect(data.borderTexts).toEqual([{ text: "a" }, { text: "b" }]);
    expect(data.lines).toEqual([{ id: "l1" }, { id: "l2" }]);
  });
});

describe("mapCoord", () => {
  const data = util.getMapData(games["18Test"], "outside", 150);
  const parse = (s) => s.split(" ").map(Number);
  const cx = data.hexX(11, 1);
  const cy = data.hexY(11, 1);

  it("should offset x/y from the center of a hex", () => {
    const [x, y] = parse(util.mapCoord("A11x10y-20", data));

    expect(x).toBeCloseTo(cx + 10);
    expect(y).toBeCloseTo(cy - 20);
  });

  it("should scale x/y with the hex width", () => {
    const half = util.getMapData(games["18Test"], "outside", 75);
    const [x, y] = parse(util.mapCoord("A11x10y20", half));

    expect(x).toBeCloseTo(half.hexX(11, 1) + 5);
    expect(y).toBeCloseTo(half.hexY(11, 1) + 10);
  });

  it("should find the points of a hex", () => {
    // Point 1 is the bottom corner, at the full edge length
    const [x, y] = parse(util.mapCoord("A11p1", data));

    expect(x).toBeCloseTo(cx);
    expect(y).toBeCloseTo(cy + 150 * util.HEX_RATIO);
  });

  it("should find the middle of a side", () => {
    // Side 1 is the left side, half a hex width away
    const [x, y] = parse(util.mapCoord("A11s1", data));

    expect(x).toBeCloseTo(cx - 75);
    expect(y).toBeCloseTo(cy);
  });

  it("should find a point by angle", () => {
    // Angle 90 points left, the middle of the left side
    const [x, y] = parse(util.mapCoord("A11a90", data));

    expect(x).toBeCloseTo(cx - 75);
    expect(y).toBeCloseTo(cy, 5);

    // Angle and length: half way along the same line
    const [hx] = parse(util.mapCoord("A11a90p0.5", data));
    expect(hx).toBeCloseTo(cx - 37.5);
  });

  it("should return other strings untouched", () => {
    expect(util.mapCoord("10 20", data)).toBe("10 20");
    expect(util.mapCoord("", data)).toBe("");
  });
});
