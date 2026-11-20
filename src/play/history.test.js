import { describe, expect, it } from "vitest";

import game from "../data/games/18Test.json";
import { describeEvent, supply, undoTarget } from "./history.js";
import { reduce } from "./reduce.js";

const log = (...events) => events.map((e, i) => ({ seq: i + 1, ...e }));
const place = (hex, tile) => ({ type: "tile.place", hex, tile, rotation: 0 });
const undo = (target) => ({ type: "undo", target });

describe("undoTarget", () => {
  it("is null for an empty log", () => {
    expect(undoTarget([])).toBeNull();
  });
  it("is the only event", () => {
    expect(undoTarget(log(place("A1", "1")))).toBe(1);
  });
  it("skips undone events", () => {
    const l = log(
      place("A1", "1"),
      place("A2", "1"),
      place("A3", "1"),
      undo(3),
    );
    expect(undoTarget(l)).toBe(4);
  });
  it("undo of an undo is a redo", () => {
    const l = log(
      place("A1", "1"),
      place("A2", "1"),
      place("A3", "1"),
      undo(3),
    );
    l.push({ seq: 5, ...undo(4) });
    expect(reduce(l).tiles.A3).toBeDefined();
    expect(undoTarget(l)).toBe(5);
    l.push({ seq: 6, ...undo(5) });
    expect(undoTarget(l)).toBe(6);
  });
  it("targets the undo itself once it is the newest effective event", () => {
    expect(undoTarget(log(place("A1", "1"), undo(1)))).toBe(2);
  });
  it("skips invalid events without throwing", () => {
    const l = [
      { seq: 1, ...place("A1", "1") },
      { seq: 2, type: "bogus" },
      null,
      { type: "tile.remove", hex: "A1" },
      { seq: 3, ...undo(99) },
    ];
    expect(undoTarget(l)).toBe(3);
    expect(undoTarget([null, { seq: 1, type: "x" }])).toBeNull();
  });
});

describe("supply", () => {
  it("counts tiles from quantities", () => {
    const s = reduce(log(place("A1", "1"), place("A2", "57")));
    const r = supply(game, s);
    expect(r.tiles["1"]).toEqual({ total: 1, used: 1, left: 0 });
    expect(r.tiles["2"]).toEqual({ total: 2, used: 0, left: 2 });
  });
  it("uses print || quantity for object entries", () => {
    const r = supply(
      { tiles: { a: { print: 3, quantity: 1 }, b: 4 } },
      reduce([]),
    );
    expect(r.tiles.a.total).toBe(3);
    expect(r.tiles.b.total).toBe(4);
  });
  it("goes negative when over-used", () => {
    const s = reduce(log(place("A1", "1"), place("A2", "1")));
    expect(supply(game, s).tiles["1"]).toEqual({ total: 1, used: 2, left: -1 });
  });
  it("counts variant ids against their own entry", () => {
    const s = reduce(log(place("A1", "26|T2")));
    const r = supply(game, s);
    expect(r.tiles["26|T2"]).toEqual({ total: 1, used: 1, left: 0 });
    expect(r.tiles["26"]).toBeUndefined();
  });
  it("counts tokens by abbreviation", () => {
    const s = reduce(
      log(
        { type: "token.place", hex: "A1", token: "B", x: 0, y: 0 },
        { type: "token.place", hex: "A2", token: "B", x: 0, y: 0 },
      ),
    );
    expect(supply(game, s).tokens).toEqual({ B: { used: 2 } });
  });
});

describe("describeEvent", () => {
  const seats = [{ userId: 7, name: "Ann" }];
  const events = [
    { type: "tile.place", hex: "A1", tile: "1", rotation: 2 },
    { type: "tile.rotate", hex: "A1", rotation: 3 },
    { type: "tile.remove", hex: "A1" },
    { type: "token.place", hex: "A1", token: "B", x: 0, y: 0 },
    { type: "token.remove", hex: "A1", token: "B", x: 0, y: 0 },
    { type: "market.move", marker: "B", cell: { row: 1, col: 2 } },
    { type: "tray.move", item: "B", from: "bank", to: "B" },
    { type: "note.set", text: "hi" },
    { type: "undo", target: 4 },
  ];
  it.each(events)("describes $type", (e) => {
    const d = describeEvent({ seq: 1, userId: 7, ...e }, { seats, game });
    expect(d.key).toBe(`play.events.${e.type}`);
    expect(d.params.user).toBe("Ann");
  });
  it("passes the details", () => {
    const d = describeEvent({ seq: 1, userId: 7, ...events[0] }, { seats });
    expect(d.params).toMatchObject({ hex: "A1", tile: "1", rotation: 2 });
  });
  it("falls back when the seat is unknown", () => {
    const d = describeEvent({ seq: 1, userId: 9, ...events[2] }, { seats });
    expect(d.params.user).toBe("9");
  });
});
