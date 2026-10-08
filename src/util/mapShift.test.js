import games from "@/data/games";
import { getMapData } from "@/util/map";
import {
  canShift,
  countLeft,
  moveDelta,
  shiftBounds,
  shiftCoord,
  shiftGame,
} from "@/util/mapShift";

const test18 = () => structuredClone(games["18Test"]);
const small = (map, extra = {}) => ({ info: { title: "T" }, map, ...extra });

describe("shiftCoord", () => {
  it("moves a coordinate by columns and rows", () => {
    expect(shiftCoord("B12", 1, 0)).toBe("B13");
    expect(shiftCoord("B12", 0, 1)).toBe("C12");
    expect(shiftCoord("B12", -1, -1)).toBe("A11");
  });

  it("gives null below A or 1", () => {
    expect(shiftCoord("A1", 0, -1)).toBeNull();
    expect(shiftCoord("A1", -1, 0)).toBeNull();
    expect(shiftCoord("nope", 1, 0)).toBeNull();
  });

  it("goes past Z", () => {
    expect(shiftCoord("Z9", 0, 1)).toBe("AA9");
    expect(shiftCoord("AZ3", 0, 1)).toBe("BA3");
    expect(shiftCoord("AA9", 0, -1)).toBe("Z9");
  });

  it("moves an array coordinate", () => {
    expect(shiftCoord([3, 2], 1, 1)).toEqual([4, 3]);
    expect(shiftCoord([1, 2], -1, 0)).toBeNull();
  });

  it("reads a zero padded number", () => {
    expect(shiftCoord("A09", 1, 0)).toBe("A10");
  });
});

describe("moveDelta", () => {
  it("moves along the page of a vertical map", () => {
    expect(moveDelta("up")).toEqual({ dx: 0, dy: -1 });
    expect(moveDelta("down")).toEqual({ dx: 0, dy: 1 });
    expect(moveDelta("left")).toEqual({ dx: -1, dy: 0 });
    expect(moveDelta("right")).toEqual({ dx: 1, dy: 0 });
  });

  it("swaps the axes of a horizontal map", () => {
    expect(moveDelta("left", true)).toEqual({ dx: 0, dy: -1 });
    expect(moveDelta("right", true)).toEqual({ dx: 0, dy: 1 });
    expect(moveDelta("up", true)).toEqual({ dx: -1, dy: 0 });
    expect(moveDelta("down", true)).toEqual({ dx: 1, dy: 0 });
  });
});

describe("shiftGame on 18Test", () => {
  it("moves every map field and the references", () => {
    const game = test18();
    const moved = shiftGame(game, 1, 1);
    const map = moved.map;
    expect(map.hexes[0].hexes).toEqual(["B12"]);
    expect(map.hexes[5].hexes).toEqual(["C13"]);
    expect(map.borders[0].coords).toEqual(["C17p4", "C17p5"]);
    expect(map.lines[0].coords).toEqual(["B16p1", "B16p4"]);
    expect(map.borderTexts[0].coord).toBe("B18a30p0.6");
    expect(moved.privates.at(-1).hex).toBe("B12");
    expect(moved.companies[0].home).toBe("I6");
    expect(moved.companies[2].home).toEqual(["D4", "E5"]);
  });

  it("leaves text, trim, copy and pixel positions alone", () => {
    const game = test18();
    const moved = shiftGame(game, 1, 0);
    expect(moved.map.trim).toEqual(game.map.trim);
    expect(moved.map.roundTracker).toEqual(game.map.roundTracker);
    expect(moved.map.movement).toEqual(game.map.movement);
    expect(moved.map.hexes[0].removeBorders).toEqual([1]);
    expect(moved.rounds).toEqual(game.rounds);
    expect(moved.tiles).toEqual(game.tiles);
    expect(JSON.stringify(moved)).toContain("Starts in B2");
  });

  it("does not change the game it is given and moves back", () => {
    const game = test18();
    const copy = structuredClone(game);
    const moved = shiftGame(game, 1, 1);
    expect(game).toEqual(copy);
    expect(shiftGame(moved, -1, -1)).toEqual(game);
  });

  it("allows left because references never block", () => {
    const game = test18();
    expect(shiftBounds(game).minX).toBeGreaterThan(1);
    expect(canShift(game, -1, 0)).toBe(true);
    expect(canShift(game, 0, -1)).toBe(false);
  });

  it("flips the parity of the first hex on an odd move", () => {
    const parity = (game) => getMapData(game, "edge", 150, 0).a1Valid;
    const game = test18();
    expect(parity(shiftGame(game, 1, 0))).toBe(!parity(game));
    expect(parity(shiftGame(game, 2, 0))).toBe(parity(game));
  });
});

describe("shiftGame shapes", () => {
  it("moves a map object and an array of maps", () => {
    const one = small({ hexes: [{ color: "plain", hexes: ["B2"] }] });
    expect(shiftGame(one, 1, 0).map.hexes[0].hexes).toEqual(["B3"]);
    const many = small([
      { hexes: [{ color: "plain", hexes: ["B2"] }] },
      { copy: 0, remove: ["B2"], borderTexts: [{ coord: "B2p0", label: "1" }] },
    ]);
    const moved = shiftGame(many, 0, 1);
    expect(moved.map[0].hexes[0].hexes).toEqual(["C2"]);
    expect(moved.map[1].remove).toEqual(["C2"]);
    expect(moved.map[1].borderTexts[0].coord).toBe("C2p0");
    expect(moved.map[1].copy).toBe(0);
  });

  it("handles no map, empty hexes and a copy without hexes", () => {
    expect(shiftGame({ info: {} }, 1, 0)).toEqual({ info: {} });
    expect(canShift({ info: {} }, 1, 0)).toBe(false);
    expect(canShift(small({ hexes: [] }), 1, 0)).toBe(false);
    const copy = small([{ hexes: [{ hexes: ["A1"] }] }, { copy: 0 }]);
    expect(shiftGame(copy, 1, 1).map[1]).toEqual({ copy: 0 });
  });

  it("moves array coordinates and the legacy copy", () => {
    const game = small({
      hexes: [{ copy: "B2", hexes: [[2, 3], "A1"] }],
    });
    const moved = shiftGame(game, 1, 1).map.hexes[0];
    expect(moved.hexes).toEqual([[3, 4], "B2"]);
    expect(moved.copy).toBe("C3");
  });

  it("keeps the suffix of borders, lines and texts", () => {
    const game = small({
      hexes: [{ hexes: ["B2"] }],
      borders: [{ coords: ["A15p1", "B16s2"] }],
      lines: [{ coords: ["A17a30p0.6", "A15p4"] }],
    });
    const moved = shiftGame(game, 1, 1).map;
    expect(moved.borders[0].coords).toEqual(["B16p1", "C17s2"]);
    expect(moved.lines[0].coords).toEqual(["B18a30p0.6", "B16p4"]);
  });

  it("moves the borders a map removes, not the sides of a hex", () => {
    const border = { color: "white", coords: ["B2p1", "B2p4"] };
    const game = small([
      { hexes: [{ hexes: ["B2"], removeBorders: [1] }], borders: [border] },
      { copy: 0, removeBorders: [border] },
    ]);
    const moved = shiftGame(game, 1, 0).map;
    expect(moved[0].hexes[0].removeBorders).toEqual([1]);
    expect(moved[1].removeBorders).toEqual([
      { color: "white", coords: ["B3p1", "B3p4"] },
    ]);
    expect(moved[0].borders[0]).toEqual(moved[1].removeBorders[0]);
  });
});

describe("blocking", () => {
  it("is blocked by a hex on column 1 or row A", () => {
    const game = small({ hexes: [{ hexes: ["A5", "C1"] }] });
    expect(canShift(game, -1, 0)).toBe(false);
    expect(canShift(game, 0, -1)).toBe(false);
    expect(canShift(game, 1, 1)).toBe(true);
    expect(shiftGame(game, -1, 0)).toBe(game);
  });

  it("is blocked by remove, borderTexts and a border alone", () => {
    expect(
      canShift(small({ hexes: [{ hexes: ["C3"] }], remove: ["A3"] }), 0, -1),
    ).toBe(false);
    expect(
      canShift(
        small({
          hexes: [{ hexes: ["C3"] }],
          borderTexts: [{ coord: "C1p0", label: "1" }],
        }),
        -1,
        0,
      ),
    ).toBe(false);
    expect(
      canShift(
        small({
          hexes: [{ hexes: ["C3"] }],
          borders: [{ coords: ["A3p1", "A3p2"] }],
        }),
        0,
        -1,
      ),
    ).toBe(false);
  });

  it("disables everything when no field holds a coordinate", () => {
    const game = small({ hexes: [] });
    [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].forEach(([dx, dy]) => expect(canShift(game, dx, dy)).toBe(false));
  });
});

describe("references left alone", () => {
  it("leaves a reference that would leave the map and counts it", () => {
    const game = small(
      { hexes: [{ hexes: ["C3"] }] },
      {
        privates: [{ name: "P", hex: "A1" }],
        companies: [{ name: "C", home: ["A2", "C3"], destination: "B1" }],
      },
    );
    const moved = shiftGame(game, -1, -1);
    expect(moved.privates[0].hex).toBe("A1");
    expect(moved.companies[0].home).toEqual(["A2", "B2"]);
    expect(moved.companies[0].destination).toBe("B1");
    expect(countLeft(game, -1, -1)).toBe(3);
  });

  it("counts token labels that look like coordinates", () => {
    const game = games["18NC"];
    const moved = shiftGame(game, 1, 1);
    const tokens = (g) => g.companies.flatMap((c) => c.tokens ?? []);
    expect(tokens(moved)).toEqual(tokens(game));
    expect(tokens(moved)).toContain("E22");
    expect(countLeft(game, 1, 1)).toBeGreaterThan(0);
  });
});
