import { diff as oracle } from "deep-object-diff";
import { describe, expect, it } from "vitest";

import { mergeDeepRight } from "ramda";

import { diff } from "./diff";

const cases = {
  equal: [
    { a: 1, b: { c: [1, 2] } },
    { a: 1, b: { c: [1, 2] } },
  ],
  added: [{ a: 1 }, { a: 1, b: 2 }],
  changed: [{ a: 1 }, { a: 2 }],
  removed: [{ a: 1, b: 2 }, { a: 1 }],
  nested: [{ a: { b: { c: 1, d: 2 } } }, { a: { b: { c: 3, d: 2 } } }],
  arrayChange: [{ a: [1, 2, 3] }, { a: [1, 5, 3] }],
  arrayShrink: [{ a: [1, 2, 3] }, { a: [1] }],
  arrayGrow: [{ a: [1] }, { a: [1, 2, 3] }],
  arrayOfObjects: [{ a: [{ x: 1 }, { x: 2 }] }, { a: [{ x: 1 }, { x: 3 }] }],
  nullToValue: [{ a: null }, { a: 1 }],
  valueToNull: [{ a: 1 }, { a: null }],
  nullToObject: [{ a: null }, { a: { b: 1 } }],
  emptyToFilled: [{ a: {} }, { a: { b: 1 } }],
  filledToEmpty: [{ a: { b: 1 } }, { a: {} }],
  emptyBoth: [{ a: {} }, { a: {} }],
  emptyArrayToFilled: [{ a: [] }, { a: [1] }],
  filledArrayToEmpty: [{ a: [1] }, { a: [] }],
  emptyArrayToEmptyObject: [{ a: [] }, { a: {} }],
  objectToPrimitive: [{ a: { b: 1 } }, { a: "x" }],
  primitiveToObject: [{ a: "x" }, { a: { b: 1 } }],
  arrayToObject: [{ a: [1] }, { a: { 0: 1 } }],
  falsy: [
    { a: 0, b: "", c: false },
    { a: false, b: 0, c: "" },
  ],
  topNumbers: [1, 2],
  topSameNumbers: [1, 1],
  topString: ["a", "b"],
  topNull: [null, { a: 1 }],
  topToNull: [{ a: 1 }, null],
  topArrays: [
    [1, 2],
    [1, 3],
  ],
  undefinedValue: [{ a: 1 }, { a: undefined }],
};

describe("diff", () => {
  it("returns the documented shapes", () => {
    expect(diff({ a: 1, b: 2 }, { a: 1, b: 2 })).toEqual({});
    expect(diff({ a: 1 }, { a: 1, b: 2 })).toEqual({ b: 2 });
    expect(diff({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
    expect(diff({ a: 1, b: 2 }, { a: 1 })).toEqual({ b: undefined });
    expect(diff({ a: { b: 1, c: 2 } }, { a: { b: 1, c: 3 } })).toEqual({
      a: { c: 3 },
    });
    expect(diff({ a: [1, 2, 3] }, { a: [1, 5, 3] })).toEqual({ a: { 1: 5 } });
    expect(diff({ a: [1, 2, 3] }, { a: [1] })).toEqual({
      a: { 1: undefined, 2: undefined },
    });
    expect(diff({ a: {} }, { a: { b: 1 } })).toEqual({ a: { b: 1 } });
    expect(diff({ a: { b: 1 } }, { a: {} })).toEqual({
      a: { b: undefined },
    });
    expect(diff(1, 2)).toBe(2);
    expect(diff(null, { a: 1 })).toEqual({ a: 1 });
  });

  it.each(Object.entries(cases))(
    "matches deep-object-diff: %s",
    (_, [l, r]) => {
      expect(diff(l, r)).toEqual(oracle(l, r));
    },
  );

  it("round trips with mergeDeepRight", () => {
    const base = { a: 1, b: { c: 2, d: { e: 3 } }, f: "x", g: null };
    const next = { a: 2, b: { c: 2, d: { e: 4 } }, f: "x", g: { h: 1 } };
    expect(mergeDeepRight(base, diff(base, next))).toEqual(next);
  });
});
