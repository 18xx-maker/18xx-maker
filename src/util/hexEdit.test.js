import games from "@/data/games";
import * as edit from "@/util/hexEdit";
import { getMapData, toCoords } from "@/util/map";

const base = (hexes, info = {}) => ({
  info: { title: "T", ...info },
  map: { hexes },
});

const cellsOf = (game) =>
  edit.validCells(getMapData(game, "edge", 150, 0)).map((c) => c.coord);

describe("findGroup", () => {
  const hexes = [
    { color: "gray", hexes: ["A1", "B2"] },
    { color: "red", hexes: ["B2", [3, 3]] },
  ];

  it("finds the groups that list a coordinate, the last one is on top", () => {
    expect(edit.findGroups(hexes, "B2")).toEqual([0, 1]);
    expect(edit.findGroup(hexes, "B2")).toBe(1);
    expect(edit.findGroup(hexes, "A1")).toBe(0);
    expect(edit.findGroup(hexes, "Z9")).toBe(-1);
  });

  it("reads an array coordinate as its name", () => {
    expect(edit.coordName([3, 3])).toBe("C3");
    expect(edit.findGroup(hexes, "C3")).toBe(1);
  });

  it("anchors a group at its first coordinate", () => {
    expect(edit.anchorOf(hexes[0])).toBe("A1");
    expect(edit.anchorOf({})).toBeUndefined();
  });
});

describe("addHexToGroup", () => {
  it("adds a coordinate as text and takes it from the other groups", () => {
    const hexes = [
      { color: "gray", hexes: ["A1", "B2"] },
      { color: "red", hexes: ["C3"] },
    ];
    const result = edit.addHexToGroup(hexes, 1, "B2");
    expect(result.hexes).toEqual([
      { color: "gray", hexes: ["A1"] },
      { color: "red", hexes: ["C3", "B2"] },
    ]);
    expect(result.index).toBe(1);
    expect(result.anchor).toBe("C3");
    // Nothing is changed in place
    expect(hexes[0].hexes).toEqual(["A1", "B2"]);
  });

  it("removes a group the move leaves empty and keeps the index of the target", () => {
    const hexes = [
      { color: "gray", hexes: ["A1"] },
      { color: "red", hexes: ["C3"] },
    ];
    const result = edit.addHexToGroup(hexes, 1, "A1");
    expect(result.hexes).toEqual([{ color: "red", hexes: ["C3", "A1"] }]);
    expect(result.index).toBe(0);
  });

  it("shares the groups it does not change", () => {
    const hexes = [
      { color: "gray", hexes: ["A1"] },
      { color: "red", hexes: ["C3"] },
      { color: "blue", hexes: ["D4"] },
    ];
    const result = edit.addHexToGroup(hexes, 1, "E5");
    expect(result.hexes[0]).toBe(hexes[0]);
    expect(result.hexes[2]).toBe(hexes[2]);
  });

  it("adds a coordinate of several groups from all of them", () => {
    const hexes = [
      { hexes: ["C14", "A1"] },
      { hexes: ["C14", "B2"] },
      { hexes: ["D5"] },
    ];
    const result = edit.addHexToGroup(hexes, 2, "C14");
    expect(result.hexes).toEqual([
      { hexes: ["A1"] },
      { hexes: ["B2"] },
      { hexes: ["D5", "C14"] },
    ]);
  });

  it("does not add a coordinate twice", () => {
    const hexes = [{ hexes: ["A1", "B2"] }];
    expect(edit.addHexToGroup(hexes, 0, "B2").hexes).toEqual(hexes);
  });
});

describe("removeHexFromGroup", () => {
  it("removes a member and moves the anchor when it was the anchor", () => {
    const hexes = [{ color: "gray", hexes: ["A1", "B2", "C3"] }];
    const result = edit.removeHexFromGroup(hexes, 0, "A1");
    expect(result.hexes).toEqual([{ color: "gray", hexes: ["B2", "C3"] }]);
    expect(result.index).toBe(0);
    expect(result.anchor).toBe("B2");
  });

  it("removes the coordinate from every group that lists it", () => {
    const hexes = [{ hexes: ["C14", "A1"] }, { hexes: ["C14", "B2"] }];
    expect(edit.removeHexFromGroup(hexes, 1, "C14").hexes).toEqual([
      { hexes: ["A1"] },
      { hexes: ["B2"] },
    ]);
  });

  it("drops an emptied group and has no anchor", () => {
    const hexes = [{ hexes: ["A1"] }, { hexes: ["B2"] }];
    const result = edit.removeHexFromGroup(hexes, 1, "B2");
    expect(result.hexes).toEqual([{ hexes: ["A1"] }]);
    expect(result.index).toBe(-1);
    expect(result.anchor).toBeUndefined();
  });

  it("keeps the index of the group when one before it goes", () => {
    const hexes = [{ hexes: ["A1"] }, { hexes: ["B2", "C3"] }];
    const result = edit.removeHexFromGroup(hexes, 1, "A1");
    expect(result.hexes).toEqual([{ hexes: ["B2", "C3"] }]);
    expect(result.index).toBe(0);
  });

  it("blocks the last hex of the map", () => {
    expect(edit.removeHexFromGroup([{ hexes: ["A1"] }], 0, "A1")).toEqual({
      blocked: "last",
    });
  });

  it("allows the last local hex when a copy has more", () => {
    expect(
      edit.removeHexFromGroup([{ hexes: ["A1"] }], 0, "A1", 3).hexes,
    ).toEqual([]);
  });
});

describe("newGroup and replaceGroup", () => {
  it("starts a group with a color and the coordinate", () => {
    expect(edit.newGroup("B4")).toEqual({ color: "plain", hexes: ["B4"] });
  });

  it("replaces a group, adds one at the end and shares what is the same", () => {
    const hexes = [{ hexes: ["A1"] }, { hexes: ["B2"] }];
    const replaced = edit.replaceGroup(hexes, 0, { hexes: ["A1", "C3"] });
    expect(replaced[0]).toEqual({ hexes: ["A1", "C3"] });
    expect(replaced[1]).toBe(hexes[1]);
    expect(edit.replaceGroup(hexes, 1, { hexes: ["B2"] })).toBe(hexes);
    expect(edit.replaceGroup(hexes, 2, { hexes: ["C3"] })).toEqual([
      ...hexes,
      { hexes: ["C3"] },
    ]);
  });
});

describe("validCells", () => {
  it("has the cells of 18Test with one row and column after", () => {
    const game = games["18Test"];
    const data = getMapData(game, "edge", 150, 0);
    const cells = edit.validCells(data);
    const names = cells.map((c) => c.coord);

    // Every hex of the map is a cell, none of them twice
    for (const group of game.map.hexes) {
      for (const coord of group.hexes) expect(names).toContain(coord);
    }
    expect(new Set(names).size).toBe(names.length);

    // Rows and columns start at 1 and the margin is one past the maximum
    const xs = cells.map((c) => c.x);
    const ys = cells.map((c) => c.y);
    const maxX = Math.max(
      ...game.map.hexes.flatMap((g) => g.hexes.map((c) => toCoords(c)[0])),
    );
    const maxY = Math.max(
      ...game.map.hexes.flatMap((g) => g.hexes.map((c) => toCoords(c)[1])),
    );
    expect(Math.min(...xs)).toBe(1);
    expect(Math.min(...ys)).toBe(1);
    expect(Math.max(...xs)).toBe(maxX + 1);
    expect(Math.max(...ys)).toBe(maxY + 1);
    expect(names.every((name) => /^[A-Z]+[1-9][0-9]*$/.test(name))).toBe(true);
  });

  it("only has positions a hex can sit on", () => {
    // A1 is valid when its column and row are both odd
    expect(cellsOf(base([{ hexes: ["A1"] }]))).toEqual(["A1", "B2"]);
    // B1 sets the other parity
    expect(cellsOf(base([{ hexes: ["B1"] }]))).toEqual(["A2", "B1", "C2"]);
  });

  it("agrees with the parity the map data decides", () => {
    for (const hexes of [["A1"], ["B1"], ["C11", "B12"], ["B2"], ["A2"]]) {
      const game = base([{ hexes }]);
      const data = getMapData(game, "edge", 150, 0);
      for (const { x, y } of edit.validCells(data)) {
        expect((x + y) % 2).toBe(data.a1Valid ? 0 : 1);
      }
    }
  });

  it("is the same for a horizontal map, in the space of the coordinates", () => {
    const hexes = [{ hexes: ["A1", "B2", "A3"] }];
    expect(cellsOf(base(hexes, { orientation: "horizontal" }))).toEqual(
      cellsOf(base(hexes)),
    );
    expect(cellsOf(base(hexes))).toEqual(["A1", "A3", "B2", "B4", "C1", "C3"]);
  });

  it("has no cell without a letter or in column 0", () => {
    for (const game of [base([{ hexes: ["A1"] }]), games["18Test"]]) {
      for (const { x, y, coord } of edit.validCells(
        getMapData(game, "edge", 150, 0),
      )) {
        expect(x).toBeGreaterThanOrEqual(1);
        expect(y).toBeGreaterThanOrEqual(1);
        expect(coord.startsWith(String(y))).toBe(false);
      }
    }
  });

  it("has nothing for a game without a map", () => {
    expect(edit.validCells({})).toEqual([]);
  });
});

describe("variations", () => {
  const game = {
    info: { title: "T" },
    map: [
      { hexes: [{ color: "red", hexes: ["A1", "B2"] }] },
      { copy: 0, remove: ["B2"], hexes: [{ color: "gray", hexes: ["C3"] }] },
    ],
  };

  it("reads and writes the groups of one variation", () => {
    expect(edit.localHexes(game, 1)).toEqual([
      { color: "gray", hexes: ["C3"] },
    ]);
    const next = edit.setLocalHexes(game, 1, [{ hexes: ["D4"] }]);
    expect(next.map[1].hexes).toEqual([{ hexes: ["D4"] }]);
    expect(next.map[1].copy).toBe(0);
    expect(next.map[0]).toBe(game.map[0]);
    const single = { map: { hexes: [] } };
    expect(
      edit.setLocalHexes(single, 0, [{ hexes: ["A1"] }]).map.hexes,
    ).toEqual([{ hexes: ["A1"] }]);
  });

  it("finds the group a copy gets from its source and what it removes", () => {
    expect(edit.inheritedGroup(game, 1, "A1")).toEqual({
      variation: 0,
      group: { color: "red", hexes: ["A1", "B2"] },
    });
    expect(edit.inheritedGroup(game, 1, "B2")).toBeNull();
    expect(edit.inheritedGroup(game, 1, "C3")).toBeNull();
    expect(edit.inheritedGroup(game, 0, "A1")).toBeNull();
    expect(edit.isRemoved(game, 1, "B2")).toBe(true);
    expect(edit.isRemoved(game, 1, "A1")).toBe(false);
    expect(edit.inheritedCount(game, 1)).toBe(1);
    expect(edit.inheritedCount(game, 0)).toBe(0);
  });
});

describe("a coordinate in two groups of 18NC", () => {
  it("is moved out of both", () => {
    const hexes = games["18NC"].map.hexes;
    const listing = edit.findGroups(hexes, "C14");
    expect(listing.length).toBe(2);
    const result = edit.removeHexFromGroup(hexes, listing[1], "C14");
    expect(edit.findGroups(result.hexes, "C14")).toEqual([]);
  });
});

describe("moveHex", () => {
  const game = {
    info: { title: "T" },
    map: {
      hexes: [
        { color: "gray", hexes: ["A1", "B2"] },
        { color: "red", hexes: ["C3"] },
      ],
    },
  };

  it("moves a hex into the selected group", () => {
    const result = edit.moveHex(game, 0, "C3", "B2");
    expect(result.game.map.hexes).toEqual([
      { color: "gray", hexes: ["A1"] },
      { color: "red", hexes: ["C3", "B2"] },
    ]);
    expect(result.anchor).toBe("C3");
  });

  it("takes a member out and moves the anchor when it was the anchor", () => {
    const result = edit.moveHex(game, 0, "A1", "A1");
    expect(result.game.map.hexes[0].hexes).toEqual(["B2"]);
    expect(result.anchor).toBe("B2");
  });

  it("clears the selection when the group is gone", () => {
    const result = edit.moveHex(game, 0, "C3", "C3");
    expect(result.game.map.hexes).toEqual([
      { color: "gray", hexes: ["A1", "B2"] },
    ]);
    expect(result.anchor).toBeUndefined();
  });

  it("blocks the last hex of the map", () => {
    const one = { info: {}, map: { hexes: [{ hexes: ["A1"] }] } };
    expect(edit.moveHex(one, 0, "A1", "A1")).toEqual({ blocked: "last" });
  });

  it("makes a group of an empty position when a hex is added to it", () => {
    const result = edit.moveHex(game, 0, "D4", "B2");
    expect(result.game.map.hexes).toEqual([
      { color: "gray", hexes: ["A1"] },
      { color: "red", hexes: ["C3"] },
      { color: "plain", hexes: ["D4", "B2"] },
    ]);
    expect(result.anchor).toBe("D4");
  });

  describe("in a variation that copies another", () => {
    const copy = {
      info: {},
      map: [
        { hexes: [{ color: "red", hexes: ["A1", "B2"] }] },
        { copy: 0, remove: ["B2"], hexes: [{ hexes: ["C3"] }] },
      ],
    };

    it("does not change a group of the source", () => {
      expect(edit.moveHex(copy, 1, "A1", "C3")).toEqual({
        blocked: "inherited",
      });
    });

    it("does not add a hex the variation removes", () => {
      expect(edit.moveHex(copy, 1, "C3", "B2")).toEqual({ blocked: "removed" });
    });

    it("selects the group of the source, read only, and moves in the variation", () => {
      expect(edit.selectionFor(copy, 1, "B2")).toBe("B2");
      expect(edit.selectionFor(copy, 1, "A1")).toBe("A1");
      expect(edit.selectedCoords(copy, 1, "A1")).toEqual(["A1", "B2"]);
      const result = edit.moveHex(copy, 1, "C3", "D4");
      expect(result.game.map[1].hexes).toEqual([{ hexes: ["C3", "D4"] }]);
      expect(result.game.map[0]).toBe(copy.map[0]);
    });

    it("lets the last local hex go when the source has more", () => {
      const result = edit.moveHex(copy, 1, "C3", "C3");
      expect(result.game.map[1].hexes).toEqual([]);
    });
  });
});

describe("selectionFor", () => {
  it("is the anchor of the group, or the position when no group has it", () => {
    const game = { map: { hexes: [{ hexes: ["A1", "B2"] }] } };
    expect(edit.selectionFor(game, 0, "B2")).toBe("A1");
    expect(edit.selectionFor(game, 0, "C3")).toBe("C3");
    expect(edit.selectedCoords(game, 0, "A1")).toEqual(["A1", "B2"]);
    expect(edit.selectedCoords(game, 0, "C3")).toEqual(["C3"]);
    expect(edit.selectedCoords(game, 0, "")).toEqual([]);
  });

  it("is the coordinate itself when the anchor is also in a later group", () => {
    const game = {
      map: { hexes: [{ hexes: ["A1", "B2"] }, { hexes: ["A1"] }] },
    };
    expect(edit.selectionFor(game, 0, "B2")).toBe("B2");
  });
});

describe("isMoveClick", () => {
  it("is Cmd on macOS and Ctrl elsewhere", () => {
    expect(edit.isMoveClick({ metaKey: true, ctrlKey: false }, true)).toBe(
      true,
    );
    expect(edit.isMoveClick({ metaKey: false, ctrlKey: true }, true)).toBe(
      false,
    );
    expect(edit.isMoveClick({ metaKey: false, ctrlKey: true }, false)).toBe(
      true,
    );
    expect(edit.isMoveClick({ metaKey: true, ctrlKey: false }, false)).toBe(
      false,
    );
  });
});

describe("groupInvalid", () => {
  it("accepts an object with a list of coordinates", () => {
    expect(
      edit.groupInvalid({ hexes: ["A1", "BB12"], color: "red" }),
    ).toBeNull();
  });

  it("rejects what is not an object", () => {
    for (const value of [null, [], "A1", 3, true]) {
      expect(edit.groupInvalid(value)).toBe("group");
    }
  });

  it("rejects hexes the map could not draw", () => {
    for (const hexes of [
      undefined,
      [],
      "A1",
      [3],
      [null],
      ["a1"],
      ["A"],
      ["A1", "B"],
      [["1", "1"]],
      ["A0 "],
    ]) {
      expect(edit.groupInvalid({ hexes })).toBe("hexes");
    }
    expect(edit.groupInvalid({})).toBe("hexes");
  });
});

describe("rerootPointer", () => {
  it("is the pointer inside the group", () => {
    expect(edit.rerootPointer("map.hexes[3].color", "map.hexes[3]")).toBe(
      "color",
    );
    expect(edit.rerootPointer("map.hexes[3]", "map.hexes[3]")).toBe("");
    expect(edit.rerootPointer("map.hexes[3].cities[0].x", "map.hexes[3]")).toBe(
      "cities[0].x",
    );
    expect(edit.rerootPointer("map[1].hexes[3].color", "map[1].hexes[3]")).toBe(
      "color",
    );
  });

  it("is nothing for another group, another variation or another part", () => {
    expect(
      edit.rerootPointer("map.hexes[31].color", "map.hexes[3]"),
    ).toBeNull();
    expect(edit.rerootPointer("map.hexes[2].color", "map.hexes[3]")).toBeNull();
    expect(
      edit.rerootPointer("map[0].hexes[3].color", "map[1].hexes[3]"),
    ).toBeNull();
    expect(edit.rerootPointer("trains[0]", "map.hexes[3]")).toBeNull();
    expect(edit.rerootPointer(undefined, "map.hexes[3]")).toBeNull();
  });

  it("names the group of a single map or of a variation", () => {
    expect(edit.groupPrefix({ map: {} }, 0, 3)).toBe("map.hexes[3]");
    expect(edit.groupPrefix({ map: [{}, {}] }, 1, 3)).toBe("map[1].hexes[3]");
  });
});
