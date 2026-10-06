import { resolveAllOf } from "@/components/schemaForm/resolve";
import {
  DECORATIONS,
  activeDecorations,
  advancedKeys,
  decorationCatalog,
  isBlank,
  isBoolOrColorValue,
  isTupleValue,
  padTuple,
  setTokenKey,
  setTuple,
  tokenFromObject,
  tokenToObject,
  tupleLength,
} from "@/components/tokenEditor/tokenModel";

import schema from "@/schemas/game.schema.json";

const token = resolveAllOf(
  schema.properties.companies.items.properties.token,
  schema,
);

describe("setTokenKey", () => {
  it("sets a value and keeps the order", () => {
    expect(Object.keys(setTokenKey({ b: 1, a: 2 }, "b", 3))).toEqual([
      "b",
      "a",
    ]);
    expect(setTokenKey({ bar: true }, "bar", false)).toEqual({ bar: false });
  });

  it("drops the key whose value says nothing, no other key", () => {
    expect(setTokenKey({ label: "", color: "red" }, "color", "")).toEqual({
      label: "",
    });
    expect(
      setTokenKey({ halves: ["a", "b"], x: {} }, "halves", ["", ""]),
    ).toEqual({ x: {} });
  });

  it("keeps a blank value the game has when another key is set", () => {
    expect(setTokenKey({ label: "", color: "red" }, "color", "blue")).toEqual({
      label: "",
      color: "blue",
    });
  });

  it("makes an object of anything else", () => {
    expect(setTokenKey(undefined, "a", 1)).toEqual({ a: 1 });
    expect(setTokenKey("3", "a", "")).toEqual({});
  });
});

describe("isBlank", () => {
  it("is true for no value, text, list or object", () => {
    for (const value of [undefined, null, "", [], {}, ["", ""]]) {
      expect(isBlank(value)).toBe(true);
    }
    for (const value of [0, false, "a", ["", "a"], { a: 1 }]) {
      expect(isBlank(value)).toBe(false);
    }
  });
});

describe("a token of the list of tokens", () => {
  it("reads text and a number as a label", () => {
    expect(tokenToObject("3")).toEqual({ label: "3" });
    expect(tokenToObject(3)).toEqual({ label: 3 });
    expect(tokenToObject({ label: "x", a: 1 })).toEqual({ label: "x", a: 1 });
    expect(tokenToObject(undefined)).toEqual({});
    expect(tokenToObject(null)).toEqual({});
  });

  it("stays bare while only the label is set, keeping its type", () => {
    const opts = (original) => ({ bare: true, original });
    expect(tokenFromObject({ label: "4" }, opts("3"))).toBe("4");
    expect(tokenFromObject({ label: 4 }, opts(3))).toBe(4);
    expect(tokenFromObject({ label: "4", color: "red" }, opts("3"))).toEqual({
      label: "4",
      color: "red",
    });
    expect(tokenFromObject({ label: "" }, opts("3"))).toBe("");
  });

  it("stays an object when it was one", () => {
    const opts = { bare: true, original: { label: "3" } };
    expect(tokenFromObject({ label: "4" }, opts)).toEqual({ label: "4" });
    expect(tokenFromObject({}, opts)).toEqual({});
  });

  it("is always an object for a company or a private, none when empty", () => {
    expect(tokenFromObject({ label: "4" })).toEqual({ label: "4" });
    expect(tokenFromObject({ label: "" })).toEqual({ label: "" });
    expect(tokenFromObject({})).toBeUndefined();
  });
});

describe("the decorations", () => {
  it("are the shapes of the token schema, with their own properties", () => {
    const catalog = decorationCatalog(token.properties);
    expect(catalog.map((d) => d.name)).toEqual(DECORATIONS);
    const keysOf = (name) => catalog.find((d) => d.name === name).keys;
    expect(keysOf("bar")).toEqual(["bar", "barHeight", "barBorderColor"]);
    expect(keysOf("shield3")).toEqual([
      "shield3",
      "shield3TopLeft",
      "shield3TopCenter",
      "shield3TopRight",
    ]);
    expect(keysOf("shield")).toEqual(["shield", "shieldTop"]);
    expect(keysOf("stripe")).toEqual(["stripe", "stripeWidth"]);
    expect(keysOf("stripes")).toEqual([
      "stripes",
      "stripesWidth",
      "stripesDistance",
    ]);
  });

  it("take in a property added to the schema", () => {
    const catalog = decorationCatalog({ ...token.properties, barPadding: {} });
    expect(catalog.find((d) => d.name === "bar").keys).toContain("barPadding");
  });

  it("leave nothing of the schema out of the groups", () => {
    const advanced = advancedKeys(token.properties);
    expect(advanced).toContain("rotation");
    expect(advanced).not.toContain("bar");
    expect(advanced).not.toContain("label");
    expect(advancedKeys({ brandNew: {} })).toEqual(["brandNew"]);
  });

  it("are active when a property of them is set", () => {
    expect(
      activeDecorations(token.properties, {
        label: "A",
        barHeight: 3,
        halves: ["red", "blue"],
        circle: "",
      }).map((d) => d.name),
    ).toEqual(["bar", "halves"]);
    expect(activeDecorations(token.properties, undefined)).toEqual([]);
  });
});

describe("a list of colors of a fixed length", () => {
  it("has the length of the schema", () => {
    expect(tupleLength(token.properties.halves, schema)).toBe(2);
    expect(tupleLength(token.properties.quarters, schema)).toBe(4);
  });

  it("is padded with empty colors", () => {
    expect(padTuple(undefined, 2)).toEqual(["", ""]);
    expect(padTuple(["red"], 3)).toEqual(["red", "", ""]);
    expect(padTuple(["a", 1, "c"], 3)).toEqual(["a", "", "c"]);
  });

  it("keeps its length when one color is set or cleared", () => {
    expect(setTuple(undefined, 2, 1, "blue")).toEqual(["", "blue"]);
    expect(setTuple(["red", "blue"], 2, 0, "")).toEqual(["", "blue"]);
    expect(setTuple(["red", ""], 2, 0, " ")).toBeUndefined();
    expect(setTuple(["a", "b", "c", "d"], 4, 2, " x ")).toEqual([
      "a",
      "b",
      "x",
      "d",
    ]);
  });
});

describe("the values the fields understand", () => {
  it("of true or a color", () => {
    for (const value of [undefined, true, false, "red"]) {
      expect(isBoolOrColorValue(value)).toBe(true);
    }
    for (const value of [1, null, {}, ["a"]]) {
      expect(isBoolOrColorValue(value)).toBe(false);
    }
  });

  it("of a list of colors", () => {
    for (const value of [undefined, [], ["a", ""]]) {
      expect(isTupleValue(value)).toBe(true);
    }
    for (const value of ["a", [1], null, {}]) {
      expect(isTupleValue(value)).toBe(false);
    }
    expect(isTupleValue(["a", "b"], 2)).toBe(true);
    expect(isTupleValue(["a", "b", "c"], 2)).toBe(false);
  });
});
