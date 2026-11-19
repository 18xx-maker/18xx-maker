import { describe, expect, it } from "vitest";

import { initialState, reduce, usedTiles } from "./reduce.js";

const log = (...events) => events.map((e, i) => ({ seq: i + 1, ...e }));
const place = (hex, tile, rotation = 0) => ({
  type: "tile.place",
  hex,
  tile,
  rotation,
});

describe("reduce", () => {
  it("starts empty", () => {
    expect(initialState()).toEqual({
      tiles: {},
      tokens: {},
      market: {},
      trays: {},
      notes: "",
    });
  });

  it("place then rotate then remove a tile", () => {
    const events = log(place("A1", "t1"));
    expect(reduce(events).tiles).toEqual({ A1: { tile: "t1", rotation: 0 } });
    events.push({ seq: 2, type: "tile.rotate", hex: "A1", rotation: 3 });
    expect(reduce(events).tiles.A1).toEqual({ tile: "t1", rotation: 3 });
    events.push({ seq: 3, type: "tile.remove", hex: "A1" });
    expect(reduce(events).tiles).toEqual({});
  });

  it("placing on an occupied hex replaces the tile", () => {
    const s = reduce(log(place("A1", "t1", 1), place("A1", "t2", 2)));
    expect(s.tiles).toEqual({ A1: { tile: "t2", rotation: 2 } });
  });

  it("rotate and remove on an empty hex change nothing", () => {
    const s = reduce(
      log(
        { type: "tile.rotate", hex: "A1", rotation: 2 },
        { type: "tile.remove", hex: "A1" },
      ),
    );
    expect(s).toEqual(initialState());
  });

  it("tokens stack on a hex and remove by exact position", () => {
    const tok = (x, y) => ({
      type: "token.place",
      hex: "B2",
      token: "k",
      x,
      y,
    });
    const s = reduce(
      log(tok(0, 0), tok(1, 1), {
        type: "token.remove",
        hex: "B2",
        token: "k",
        x: 1,
        y: 1,
      }),
    );
    expect(s.tokens.B2).toEqual([{ token: "k", x: 0, y: 0 }]);
    const miss = reduce(
      log(tok(0, 0), {
        type: "token.remove",
        hex: "B2",
        token: "k",
        x: 5,
        y: 5,
      }),
    );
    expect(miss.tokens.B2).toHaveLength(1);
  });

  it("market.move sets and replaces a marker cell", () => {
    const mv = (row, col) => ({
      type: "market.move",
      marker: "m",
      cell: { row, col },
    });
    expect(reduce(log(mv(1, 2))).market.m).toEqual({ row: 1, col: 2 });
    expect(reduce(log(mv(1, 2), mv(3, 4))).market.m).toEqual({
      row: 3,
      col: 4,
    });
  });

  it("tray.move moves an item between bank and a seat", () => {
    const mv = (item, from, to) => ({ type: "tray.move", item, from, to });
    const s = reduce(log(mv("c", "bank", "s1"), mv("c", "s1", "s2")));
    expect(s.trays.s1).toEqual([]);
    expect(s.trays.s2).toEqual(["c"]);
    const added = reduce(log(mv("x", "bank", "s1")));
    expect(added.trays.s1).toEqual(["x"]);
  });

  it("note.set replaces the note", () => {
    const s = reduce(
      log({ type: "note.set", text: "a" }, { type: "note.set", text: "b" }),
    );
    expect(s.notes).toBe("b");
  });

  it("undo cancels the move it targets", () => {
    const s = reduce(
      log(place("A1", "t1"), place("A2", "t2"), { type: "undo", target: 2 }),
    );
    expect(Object.keys(s.tiles)).toEqual(["A1"]);
  });

  it("undo of an undo restores the move (redo)", () => {
    const s = reduce(
      log(
        place("A1", "t1"),
        { type: "undo", target: 1 },
        {
          type: "undo",
          target: 2,
        },
      ),
    );
    expect(s.tiles.A1).toEqual({ tile: "t1", rotation: 0 });
  });

  it("undo with an unknown or later target is ignored", () => {
    const s = reduce(
      log(
        place("A1", "t1"),
        { type: "undo", target: 99 },
        { type: "undo", target: 3 },
        { type: "undo", target: 4 },
      ),
    );
    expect(s.tiles.A1).toBeDefined();
  });

  it("skips invalid and unknown events", () => {
    const s = reduce([
      { seq: 1, type: "nope" },
      { seq: 2, type: "tile.place", hex: "A1" },
      { seq: 3, ...place("B1", "t") },
    ]);
    expect(Object.keys(s.tiles)).toEqual(["B1"]);
  });

  it("applies events in seq order and does not mutate input state", () => {
    const base = initialState();
    const frozen = JSON.stringify(base);
    const s = reduce(
      [
        { seq: 2, ...place("A1", "t2") },
        { seq: 1, ...place("A1", "t1") },
      ],
      base,
    );
    expect(s.tiles.A1.tile).toBe("t2");
    expect(JSON.stringify(base)).toBe(frozen);
  });

  it("replaying the same log twice gives equal states (deepEqual)", () => {
    const events = log(
      place("A1", "t1"),
      { type: "undo", target: 1 },
      place("B1", "t2"),
    );
    expect(reduce(events)).toEqual(reduce(events));
  });

  it("usedTiles counts tiles by id", () => {
    const s = reduce(
      log(place("A1", "t1"), place("A2", "t1"), place("A3", "t2")),
    );
    expect(usedTiles(s)).toEqual({ t1: 2, t2: 1 });
  });
});
