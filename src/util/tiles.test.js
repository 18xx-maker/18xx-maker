import { compileTiles, gatherTileColors } from "@/util/tiles";

describe("compileTiles", () => {
  it("merges tile files and sets each tile id", () => {
    expect(
      compileTiles({ 1: { color: "yellow" } }, { 14: { color: "green" } }),
    ).toEqual({
      1: { color: "yellow", id: "1" },
      14: { color: "green", id: "14" },
    });
  });

  it("adds a copy of a tile for each alias", () => {
    const tiles = compileTiles({
      1: { color: "yellow", aliases: ["1a", "1b"] },
    });
    expect(tiles["1a"]).toEqual({
      color: "yellow",
      aliases: ["1a", "1b"],
      id: "1a",
    });
    expect(tiles["1b"].id).toBe("1b");
    expect(tiles["1a"].aliases).not.toBe(tiles["1"].aliases);
  });
});

describe("gatherTileColors", () => {
  it("lists each color once after other", () => {
    expect(
      gatherTileColors({
        1: { color: "yellow" },
        2: { color: "green" },
        3: { color: "yellow" },
      }),
    ).toEqual(["other", "yellow", "green"]);
  });
});
