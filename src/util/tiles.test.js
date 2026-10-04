import {
  compileTiles,
  customTiles,
  gamesOfEntry,
  gatherTileColors,
  mergeKnownTiles,
  tileUsage,
} from "@/util/tiles";

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

describe("customTiles", () => {
  it("keeps only full definitions and sets their id", () => {
    expect(
      customTiles({
        1: 2,
        2: { tile: "57" },
        3: { quantity: 1 },
        T1: { color: "offboard", quantity: 1 },
      }),
    ).toEqual({ T1: { color: "offboard", quantity: 1, id: "T1" } });
  });

  it("skips malformed definitions", () => {
    expect(
      customTiles({
        A: { color: "red", values: "x" },
        B: { color: "red", values: [null] },
        C: { color: "red", values: [{ value: null }] },
        D: { color: "red", values: [{ value: 3 }, { value: "2+1" }] },
        E: [],
      }),
    ).toEqual({ D: expect.objectContaining({ id: "D" }) });
  });

  it("has none without tiles", () => {
    expect(customTiles(undefined)).toEqual({});
  });
});

describe("tileUsage", () => {
  const a = { slug: "a", title: "A", tiles: { 1: 2, 2: { tile: "57" } } };
  const b = {
    slug: "b",
    title: "B",
    tiles: { 1: { quantity: 3 }, T1: { color: "gray" } },
  };

  it("lists the games using each tile, aliases and extra data too", () => {
    expect(tileUsage([a, b])).toEqual({
      1: [a, b],
      57: [a],
    });
  });

  it("does not credit a generic id for a full custom definition", () => {
    const d = { slug: "d", title: "D", tiles: { 1: { color: "green" } } };
    expect(tileUsage([d])[1]).toBeUndefined();
  });

  it("credits the base id of base|extra ids and alias targets", () => {
    const e = {
      slug: "e",
      title: "E",
      tiles: { "7|x": 1, 9: { tile: "57|y" } },
    };
    const usage = tileUsage([e]);
    expect(usage["7"]).toEqual([e]);
    expect(usage["7|x"]).toEqual([e]);
    expect(usage["57"]).toEqual([e]);
    expect(usage["57|y"]).toEqual([e]);
  });

  it("lists a game once per tile", () => {
    const c = { slug: "c", title: "C", tiles: { 57: 1, 2: { tile: "57" } } };
    expect(tileUsage([c])[57]).toEqual([c]);
  });
});

describe("mergeKnownTiles", () => {
  const generic = compileTiles({ 1: { color: "yellow", cities: [1] } });
  const game = (slug, tiles) => ({ slug, title: slug, tiles });

  it("lists a game tile the same as a generic one once", () => {
    const entries = mergeKnownTiles(generic, [
      game("a", { 1: { color: "yellow", cities: [1] } }),
    ]);
    expect(entries.map((e) => e.id)).toEqual(["1"]);
    expect(entries[0].slugs).toBeUndefined();
  });

  it("still credits a game defining a generic tile", () => {
    const a = game("a", { 1: { color: "yellow", cities: [1] } });
    const b = game("b", { 1: 1 });
    const entries = mergeKnownTiles(generic, [a, b]);
    const usage = tileUsage([a, b]);

    expect(entries).toHaveLength(1);
    expect(gamesOfEntry(entries[0], [a, b], usage)).toEqual([a, b]);
  });

  it("ignores a quantity difference", () => {
    const entries = mergeKnownTiles(generic, [
      game("a", { 1: { color: "yellow", cities: [1], quantity: 4 } }),
    ]);
    expect(entries.map((e) => e.id)).toEqual(["1"]);
  });

  it("keeps a different definition and a game only tile as entries", () => {
    const a = game("a", { 1: { color: "green" }, T1: { color: "gray" } });
    const b = game("b", { T1: { color: "gray" } });
    const entries = mergeKnownTiles(generic, [a, b]);

    expect(entries.map((e) => [e.id, e.slugs])).toEqual([
      ["1", undefined],
      ["1", ["a"]],
      ["T1", ["a", "b"]],
    ]);
    expect(entries[1].gameTiles).toBe(a.tiles);
    expect(new Set(entries.map((e) => e.key)).size).toBe(3);
  });
});
