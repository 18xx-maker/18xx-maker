import { describe, expect, it } from "vitest";

import { EVENT_TYPES, validateEvent } from "./events.js";

const valid = [
  { type: "tile.place", hex: "A1", tile: "t1", rotation: 0 },
  { type: "tile.rotate", hex: "A1", rotation: 5 },
  { type: "tile.remove", hex: "A1" },
  { type: "token.place", hex: "A1", token: "k1", x: 1.5, y: -2 },
  { type: "token.remove", hex: "A1", token: "k1", x: 0, y: 0 },
  { type: "market.move", marker: "m1", cell: { row: 1, col: 2 } },
  { type: "tray.move", item: "i1", from: "bank", to: "seat1" },
  { type: "note.set", text: "hello" },
  { type: "undo", target: 1 },
];

describe("validateEvent", () => {
  it("accepts every event type in its minimal valid form", () => {
    for (const e of valid) expect(validateEvent(e)).toBeNull();
  });

  it("rejects non objects, missing or unknown type", () => {
    for (const e of [null, undefined, 1, "x", [], {}, { type: "nope" }])
      expect(typeof validateEvent(e)).toBe("string");
  });

  it("rejects wrong field types", () => {
    const bad = [
      { type: "tile.rotate", hex: "A1", rotation: 6 },
      { type: "tile.rotate", hex: "A1", rotation: 1.5 },
      { type: "market.move", marker: "m", cell: { row: "1", col: 1 } },
      { type: "token.place", hex: "A1", token: "k", x: "1", y: 0 },
      { type: "note.set", text: "a".repeat(10001) },
      { type: "undo", target: 0 },
      { type: "tile.remove", hex: "" },
      { type: "tray.move", item: "i", from: "bank" },
    ];
    for (const e of bad) expect(typeof validateEvent(e)).toBe("string");
  });

  it("rejects extra properties", () => {
    expect(
      typeof validateEvent({ type: "tile.remove", hex: "A1", extra: 1 }),
    ).toBe("string");
    expect(
      typeof validateEvent({
        type: "market.move",
        marker: "m",
        cell: { row: 1, col: 1, z: 1 },
      }),
    ).toBe("string");
  });

  it("lists every type in EVENT_TYPES", () => {
    expect(EVENT_TYPES).toHaveLength(9);
    for (const e of valid) expect(EVENT_TYPES).toContain(e.type);
  });
});
