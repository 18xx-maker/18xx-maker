import { assoc, propOr } from "ramda";

import {
  combinePathReducers,
  combineReducers,
  composeReducers,
  reducePath,
} from "@/state/helpers";

describe("combineReducers", () => {
  it("should handle a undefined input", () => {
    const reducer = combineReducers();
    expect(reducer()).toEqual({});
  });

  it("should handle an empty object", () => {
    const reducer = combineReducers({});
    expect(reducer()).toEqual({});
  });

  it("should handle a single empty reducer", () => {
    const reducer = combineReducers({ foo: () => ({}) });
    expect(reducer()).toEqual({ foo: {} });
  });

  it("should handle a single simple reducer", () => {
    const reducer = combineReducers({ foo: (state = 0) => state + 1 });
    expect(reducer()).toEqual({ foo: 1 });
  });

  it("should handle two simple reducers", () => {
    const reducer = combineReducers({
      foo: (state = 0) => state + 1,
      bar: (state = 0) => state + 2,
    });
    expect(reducer(reducer())).toEqual({ foo: 2, bar: 4 });
  });

  it("should leave other fields alone", () => {
    const reducer = combineReducers({
      foo: (state = 0) => state + 1,
      bar: (state = 0) => state + 2,
    });
    expect(reducer(reducer({ test: "baz" }))).toEqual({
      test: "baz",
      foo: 2,
      bar: 4,
    });
  });
});

describe("composeReducers", () => {
  it("should handle a undefined input", () => {
    const reducer = composeReducers();
    expect(reducer()).toEqual(undefined);
  });

  it("should handle a single empty reducer", () => {
    const reducer = composeReducers(() => ({}));
    expect(reducer()).toEqual({});
  });

  it("should handle two empty reducers", () => {
    const reducer = composeReducers(
      () => ({}),
      () => ({}),
    );
    expect(reducer()).toEqual({});
  });

  it("should handle a single simple reducer", () => {
    const reducer = composeReducers((state = 0) => state + 1);
    expect(reducer()).toEqual(1);
  });

  it("should handle two simple reducers", () => {
    const reducer = composeReducers(
      (state = 0) => state + 1,
      (state = 0) => state + 2,
    );
    expect(reducer()).toEqual(3);
  });

  it("should handle more interesting reducers", () => {
    const reducer = composeReducers(
      (state = {}) => ({ ...state, foo: true }),
      (state = {}) => assoc("bar", propOr(0, "bar", state) + 2, state),
    );
    expect(reducer(reducer())).toEqual({ foo: true, bar: 4 });
  });

  it("should leave other fields alone", () => {
    const reducer = composeReducers(
      (state = {}) => ({ ...state, foo: true }),
      (state = {}) => assoc("bar", propOr(0, "bar", state) + 2, state),
    );
    expect(reducer(reducer({ test: "baz" }))).toEqual({
      test: "baz",
      foo: true,
      bar: 4,
    });
  });
});

describe("combinePathReducers", () => {
  it("should handle a undefined input", () => {
    const reducer = combinePathReducers();
    expect(reducer()).toEqual();
  });

  it("should handle an empty object", () => {
    const reducer = combinePathReducers();
    expect(reducer({})).toEqual({});
  });

  it("should handle a single undefined reducer", () => {
    const reducer = combinePathReducers({ foo: () => {} });
    expect(reducer()).toEqual({ foo: undefined });
  });

  it("should handle a single empty reducer", () => {
    const reducer = combinePathReducers({ foo: () => ({}) });
    expect(reducer()).toEqual({ foo: {} });
  });

  it("should handle a deep single empty reducer", () => {
    const reducer = combinePathReducers({ "foo.bar": () => ({}) });
    expect(reducer()).toEqual({ foo: { bar: {} } });
  });

  it("should handle two deep empty reducers", () => {
    const reducer = combinePathReducers({
      "foo.bar": () => ({}),
      "foo.baz": () => ({}),
    });
    expect(reducer()).toEqual({ foo: { bar: {}, baz: {} } });
  });

  it("should handle more interesting reducers", () => {
    const reducer = combinePathReducers({
      "foo.bar.baz": (state = 0) => 2 * (state + 1),
      "18xx-maker": () => "is great",
      "cool.string": (state = "") => state + "!",
    });
    expect(reducer(reducer())).toEqual({
      foo: { bar: { baz: 6 } },
      "18xx-maker": "is great",
      cool: { string: "!!" },
    });
  });

  it("should leave other fields alone", () => {
    const reducer = combinePathReducers({
      "foo.bar.baz": (state = 0) => 2 * (state + 1),
      "18xx-maker": () => "is great",
      "cool.string": (state = "") => state + "!",
    });
    expect(reducer(reducer({ test: "baz" }))).toEqual({
      test: "baz",
      foo: { bar: { baz: 6 } },
      "18xx-maker": "is great",
      cool: { string: "!!" },
    });
  });
});

describe("reducePath", () => {
  it("should handle a undefined input", () => {
    const reducer = reducePath();
    expect(reducer()).toEqual(undefined);
  });

  it("should handle an empty object", () => {
    const reducer = reducePath([], () => ({}));
    expect(reducer()).toEqual({});
  });

  it("should handle a single undefined reducer", () => {
    const reducer = reducePath(["foo"], () => {});
    expect(reducer()).toEqual({ foo: undefined });
  });

  it("should handle a single empty reducer", () => {
    const reducer = reducePath(["foo"], () => ({}));
    expect(reducer()).toEqual({ foo: {} });
  });

  it("should handle a deep single empty reducer", () => {
    const reducer = reducePath(["foo", "bar"], () => ({}));
    expect(reducer()).toEqual({ foo: { bar: {} } });
  });

  it("should leave other fields alone", () => {
    const reducer = reducePath(["foo", "bar"], () => "baz");
    expect(reducer({ a: true, b: 2 })).toEqual({
      a: true,
      b: 2,
      foo: { bar: "baz" },
    });
  });
});
