import { getMapData, toCoords } from "@/util/map";

// Coordinates are [number, letter]: A1 [1,1], A3 [3,1], B2 [2,2], C1 [1,3]
const game = (hexes, orientation) => ({
  info: { orientation },
  map: { hexes: [{ hexes }] },
});
const hexes = ["A1", "A3", "B2", "C1"];
// 1.5 * hex edge for a 100 wide hex
const row = 1.5 * 100 * 0.57735;

describe("toCoords", () => {
  it("returns null for strings that aren't coordinates", () => {
    expect(toCoords("??")).toBeNull();
  });
});

describe("getMapData edge coordinate positions", () => {
  const data = getMapData(game(hexes), "edge", 100, 0);

  it("puts top coordinates above the top hex of each column", () => {
    expect(data.topCoord(1)).toBeCloseTo(8);
    // Column 2 starts a row lower than its neighbors, so it moves up by the
    // half row its neighbors stick out
    expect(data.topCoord(2)).toBeCloseTo(10 + row - 100 * 0.57735);
  });

  it("puts bottom coordinates below the bottom hex of each column", () => {
    expect(data.bottomCoord(1)).toBeCloseTo(-46 + row * 4);
    expect(data.bottomCoord(2)).toBeCloseTo(-48 + row * 3 + 100 * 0.57735);
  });

  it("puts left and right coordinates beside the ends of each row", () => {
    expect(data.leftCoord(1)).toBe(10);
    expect(data.leftCoord(2)).toBe(60);
    expect(data.rightCoord(1)).toBe(240);
    expect(data.rightCoord(3)).toBe(140);
  });

  it("swaps the axes for horizontal maps", () => {
    const horizontal = getMapData(game(hexes, "horizontal"), "edge", 100, 0);
    expect(horizontal.topCoord(2)).toBe(data.leftCoord(2));
    expect(horizontal.leftCoord(2)).toBeCloseTo(data.topCoord(2));
    expect(horizontal.bottomCoord(1)).toBe(data.rightCoord(1));
    expect(horizontal.rightCoord(1)).toBeCloseTo(data.bottomCoord(1));
  });
});

describe("getMapData a1Valid", () => {
  it.each([
    ["A1", true],
    ["B2", true],
    ["A2", false],
    ["B1", false],
  ])("is %s for a map starting at %s", (hex, valid) => {
    expect(getMapData(game([hex]), "edge", 100, 0).a1Valid).toBe(valid);
  });
});
