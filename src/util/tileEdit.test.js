import { describe, expect, it } from "vitest";

import fixtureGame from "@/data/games/18Test.json";
import {
  addTile,
  baseId,
  customizeTile,
  duplicateTile,
  effectiveTile,
  hasTile,
  privatesUsing,
  removeTile,
  renameTile,
  setTile,
  tileFields,
  tileIds,
  tileShape,
  writeTile,
} from "@/util/tileEdit";

const library = {
  57: { id: "57", color: "yellow", aliases: ["x57"], track: [{ side: 1 }] },
  63: { id: "63", color: "brown", track: [{ side: 2 }] },
};

// One entry of each shape, and a private that draws a tile
const game = () => ({
  info: { title: "Test" },
  privates: [
    { name: "A", tile: "T1" },
    { name: "B", tile: "63" },
    { name: "C", tile: "T1" },
    { name: "D" },
  ],
  tiles: {
    B1: 1,
    "26|T2": 1,
    63: { quantity: 2, print: 3 },
    A2: { tile: "57", quantity: 2 },
    T1: {
      color: "offboard",
      quantity: 1,
      track: [{ type: "offboard", side: 1 }],
    },
    B9: 4,
  },
});

describe("tile shapes", () => {
  it("tells the four shapes of an entry apart, the way getTile does", () => {
    const tiles = game().tiles;
    expect(tileShape(tiles.B1)).toBe("quantity");
    expect(tileShape(tiles.A2)).toBe("alias");
    expect(tileShape(tiles["63"])).toBe("override");
    expect(tileShape(tiles.T1)).toBe("definition");
    // An alias wins over a color, as in getTile
    expect(tileShape({ tile: "57", color: "red" })).toBe("alias");
  });

  it("finds the ids, the base of an id and whether a tile exists", () => {
    expect(tileIds(game())).toEqual(["63", "B1", "26|T2", "A2", "T1", "B9"]);
    expect(tileIds({})).toEqual([]);
    expect(baseId("26|T2")).toBe("26");
    expect(baseId("63")).toBe("63");
    expect(hasTile(game(), "26|T2")).toBe(true);
    expect(hasTile(game(), "toString")).toBe(false);
    expect(hasTile({}, "63")).toBe(false);
  });

  it("draws each shape as the tile it is", () => {
    const g = game();
    expect(effectiveTile(g, "T1", library)).toBe(g.tiles.T1);
    expect(effectiveTile(g, "A2", library)).toBe(library["57"]);
    expect(effectiveTile(g, "63", library)).toEqual({
      ...library["63"],
      quantity: 2,
      print: 3,
    });
    expect(effectiveTile({ tiles: { "63|x": 1 } }, "63|x", library)).toBe(
      library["63"],
    );
    expect(effectiveTile(g, "B1", library)).toBeUndefined();
    expect(effectiveTile({ tiles: { Z: {} } }, "Z", library)).toBeUndefined();
  });
});

describe("writing the fields of an entry", () => {
  it("shows a quantity as the field and keeps an integer when only it changes", () => {
    expect(tileFields(3)).toEqual({ quantity: 3 });
    expect(tileFields({ tile: "57" })).toEqual({ tile: "57" });
    expect(writeTile(3, { quantity: 5 })).toBe(5);
    // Nothing left to write: the integer stays
    expect(writeTile(3, {})).toBe(3);
    // Another field, or a quantity an integer cannot hold, needs an object
    expect(writeTile(3, { quantity: 3, print: 1 })).toEqual({
      quantity: 3,
      print: 1,
    });
    expect(writeTile(3, { quantity: "∞" })).toEqual({ quantity: "∞" });
  });

  it("never promotes or adds to the other shapes", () => {
    expect(writeTile({ tile: "57" }, { tile: "57", quantity: 2 })).toEqual({
      tile: "57",
      quantity: 2,
    });
    // An override that loses its last field stays an object
    expect(writeTile({ print: 1 }, {})).toEqual({});
    const definition = { color: "red", quantity: 2 };
    expect(writeTile(definition, { color: "red" })).toEqual({ color: "red" });
    // An alias without its tile and a definition without its color stay
    const alias = { tile: "57", quantity: 2 };
    expect(writeTile(alias, { quantity: 2 })).toBe(alias);
    expect(writeTile(definition, { quantity: 2 })).toBe(definition);
  });

  it("replaces an entry in place", () => {
    const next = setTile(game(), "B1", 7);
    expect(next.tiles.B1).toBe(7);
    expect(Object.keys(next.tiles)).toEqual(tileIds(game()));
    const g = game();
    expect(setTile(g, "missing", 1)).toBe(g);
  });
});

describe("adding, copying and removing", () => {
  it("adds a generic tile as a quantity and any other id as a tile to draw", () => {
    expect(addTile(game(), "57", library).game.tiles["57"]).toBe(1);
    expect(addTile(game(), "63|x", library).game.tiles["63|x"]).toBe(1);
    const added = addTile(game(), " Z1 ", library);
    expect(added.id).toBe("Z1");
    expect(added.game.tiles.Z1).toEqual({ color: "yellow", quantity: 1 });
    expect(Object.keys(added.game.tiles).at(-1)).toBe("Z1");
    expect(addTile({ info: {} }, "Z1", library).game.tiles).toEqual({
      Z1: { color: "yellow", quantity: 1 },
    });
  });

  it("refuses an empty or a taken id", () => {
    expect(addTile(game(), "  ", library)).toEqual({ error: "empty" });
    expect(addTile(game(), "T1", library)).toEqual({ error: "exists" });
  });

  it("copies right after the original, as a variant or as a name of its own", () => {
    const quantity = duplicateTile(game(), "B1");
    expect(quantity.id).toBe("B1|2");
    const keys = Object.keys(quantity.game.tiles);
    expect(keys.indexOf("B1|2")).toBe(keys.indexOf("B1") + 1);
    expect(quantity.game.tiles["B1|2"]).toBe(1);

    const once = duplicateTile(game(), "T1");
    expect(once.id).toBe("T1-copy");
    expect(Object.keys(once.game.tiles).indexOf("T1-copy")).toBe(
      Object.keys(once.game.tiles).indexOf("T1") + 1,
    );
    const twice = duplicateTile(once.game, "T1");
    expect(twice.id).toBe("T1-copy3");
    // A copy is a copy, not the same object
    expect(once.game.tiles["T1-copy"]).toEqual(game().tiles.T1);
    expect(once.game.tiles["T1-copy"]).not.toBe(once.game.tiles.T1);
    expect(duplicateTile(game(), "63").id).toBe("63|2");
    expect(duplicateTile(game(), "nope")).toEqual({ error: "missing" });
  });

  it("removes a tile, and the tiles of a game that has no more", () => {
    const g = game();
    expect(Object.keys(removeTile(g, "A2").tiles)).toEqual(
      tileIds(g).filter((id) => id !== "A2"),
    );
    expect(removeTile(g, "nope")).toBe(g);
    const last = removeTile({ info: {}, tiles: { T1: 1 } }, "T1");
    expect(last).toEqual({ info: {} });
    expect("tiles" in last).toBe(false);
  });
});

describe("customizing a library tile", () => {
  it("copies the generic tile into the game with the quantity of the entry", () => {
    const g = {
      tiles: { 63: 2, "57|x": { print: 1 }, A2: { tile: "57", quantity: 3 } },
    };
    const quantity = customizeTile(g, "63", library).game.tiles["63"];
    expect(quantity).toEqual({
      color: "brown",
      track: [{ side: 2 }],
      quantity: 2,
    });
    expect(library["63"].track).not.toBe(quantity.track);

    const override = customizeTile(g, "57|x", library).game.tiles["57|x"];
    expect(override).toEqual({
      color: "yellow",
      track: [{ side: 1 }],
      print: 1,
    });
    expect("aliases" in override).toBe(false);
    expect("id" in override).toBe(false);

    const alias = customizeTile(g, "A2", library).game.tiles.A2;
    expect(alias).toEqual({
      color: "yellow",
      track: [{ side: 1 }],
      quantity: 3,
    });
    expect(Object.keys(customizeTile(g, "A2", library).game.tiles)).toEqual(
      Object.keys(g.tiles),
    );
  });

  it("only customizes what is in the library", () => {
    expect(customizeTile(game(), "T1", library)).toEqual({
      error: "definition",
    });
    expect(customizeTile(game(), "B1", library)).toEqual({ error: "library" });
    expect(customizeTile(game(), "nope", library)).toEqual({
      error: "missing",
    });
  });
});

describe("renaming a tile", () => {
  it("renames a definition where it is and the privates that draw it", () => {
    const g = game();
    const { game: next } = renameTile(g, "T1", "T9");
    expect(Object.keys(next.tiles)).toEqual(
      tileIds(g).map((id) => (id === "T1" ? "T9" : id)),
    );
    expect(next.tiles.T9).toBe(g.tiles.T1);
    expect(next.privates.map((p) => p.tile)).toEqual([
      "T9",
      "63",
      "T9",
      undefined,
    ]);
    expect(next.privates[3]).toBe(g.privates[3]);
    expect(next.info).toBe(g.info);
    // The original is untouched
    expect(g.tiles.T1).toBeDefined();
    expect(g.privates[0].tile).toBe("T1");
  });

  it("renames an alias freely, and does not touch the aliases that name it", () => {
    const g = { tiles: { A2: { tile: "57" }, A3: { tile: "A2" } } };
    const { game: next } = renameTile(g, "A2", "A9");
    expect(next.tiles).toEqual({ A9: { tile: "57" }, A3: { tile: "A2" } });
  });

  it("follows the variants of an id", () => {
    const g = {
      tiles: { "26|T2": 1, B1: { color: "red" }, "B1|2": { color: "red" } },
      privates: [{ tile: "26|T2" }, { tile: "26" }],
    };
    const { game: next } = renameTile(g, "26|T2", "26|T3");
    expect(Object.keys(next.tiles)).toEqual(["26|T3", "B1", "B1|2"]);
    // Only the exact id: 26 is another entry
    expect(next.privates).toEqual([{ tile: "26|T3" }, { tile: "26" }]);
    const defn = renameTile(g, "B1|2", "B1|variant").game;
    expect(Object.keys(defn.tiles)).toEqual(["26|T2", "B1", "B1|variant"]);
  });

  it("keeps a library tile drawing the tile it draws", () => {
    const g = game();
    expect(renameTile(g, "B1", "B2")).toEqual({ error: "library" });
    expect(renameTile(g, "63", "T7")).toEqual({ error: "library" });
    // The variant may change, the base may not
    expect(renameTile(g, "26|T2", "26|T3").game.tiles["26|T3"]).toBe(1);
    expect(renameTile(g, "26|T2", "26").game.tiles["26"]).toBe(1);
  });

  it("refuses a missing tile, an empty id and a collision", () => {
    const g = game();
    expect(renameTile(g, "nope", "X")).toEqual({ error: "missing" });
    expect(renameTile(g, "T1", "   ")).toEqual({ error: "empty" });
    expect(renameTile(g, "T1", "A2")).toEqual({ error: "exists" });
    expect(renameTile(g, "T1", "63")).toEqual({ error: "exists" });
  });

  it("gives the same game for the same id", () => {
    const g = game();
    expect(renameTile(g, "T1", "T1").game).toBe(g);
    expect(renameTile(g, "T1", " T1 ").game).toBe(g);
  });

  it("has privatesUsing count the privates of a tile", () => {
    expect(privatesUsing(game(), "T1")).toEqual([0, 2]);
    expect(privatesUsing({}, "T1")).toEqual([]);
  });
});

describe("the 18Test game", () => {
  it("has one entry of each shape", () => {
    const shapes = Object.values(fixtureGame.tiles).map(tileShape);
    expect(new Set(shapes)).toEqual(
      new Set(["quantity", "alias", "override", "definition"]),
    );
  });

  it("renames the tile a private draws and leaves the map, the groups and the rest alone", () => {
    const { game: next } = renameTile(fixtureGame, "T1", "T11");
    const before = structuredClone(fixtureGame);
    expect(Object.keys(next.tiles)).toEqual(
      Object.keys(before.tiles).map((id) => (id === "T1" ? "T11" : id)),
    );
    expect(next.privates.filter((p) => p.tile === "T11")).toHaveLength(1);
    expect(next.privates.some((p) => p.tile === "T1")).toBe(false);
    expect(next.map).toBe(fixtureGame.map);
    expect(next.groups).toBe(fixtureGame.groups);
    expect(next.companies).toBe(fixtureGame.companies);
    // The input is not changed
    expect(fixtureGame).toEqual(before);
  });

  it("renames a variant and an alias, and refuses a taken id", () => {
    expect(
      Object.keys(renameTile(fixtureGame, "26|T2", "26|T3").game.tiles),
    ).toContain("26|T3");
    expect(renameTile(fixtureGame, "2", "A2").game.tiles.A2).toEqual(
      fixtureGame.tiles["2"],
    );
    expect(renameTile(fixtureGame, "B1", "B2")).toEqual({ error: "exists" });
  });
});

describe("renameTile order", () => {
  it("keeps the order, except that ids that are whole numbers come first", () => {
    const g = {
      tiles: {
        B1: { color: "red" },
        T1: { color: "red" },
        T2: { color: "red" },
      },
    };
    expect(Object.keys(renameTile(g, "T1", "T9").game.tiles)).toEqual([
      "B1",
      "T9",
      "T2",
    ]);
    // An object puts integer keys first: the tile does not stay in the middle
    expect(Object.keys(renameTile(g, "T1", "12").game.tiles)).toEqual([
      "12",
      "B1",
      "T2",
    ]);
  });
});
