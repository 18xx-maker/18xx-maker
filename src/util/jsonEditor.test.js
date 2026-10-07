import {
  MIN_DELAY,
  configLens,
  debounceDelay,
  duplicateKeys,
  foldRanges,
  invalidReason,
  lossyNumbers,
  minimalChange,
  parseGameText,
  parseTree,
  pointerParts,
  pointerToLine,
  pointerToRange,
  sameGame,
  shareUnchanged,
} from "@/util/jsonEditor";

const text = `{
  "info": { "title": "T" },
  "map": { "hexes": [{ "color": "red" }, { "color": "blue", "x": [1, 2] }] }
}`;

const slice = (pointer, source = text) => {
  const { from, to } = pointerToRange(parseTree(source), source, pointer);
  return source.slice(from, to);
};

describe("parseGameText", () => {
  it("parses valid text", () => {
    expect(parseGameText('{"a":1}')).toEqual({ ok: true, value: { a: 1 } });
    expect(parseGameText("[]").ok).toBe(true);
  });

  it("reports line and column of a syntax error", () => {
    const result = parseGameText('{\n  "a": 1,\n  "b" 2\n}');
    expect(result.ok).toBe(false);
    expect(result.line).toBe(3);
    expect(result.column).toBeGreaterThan(1);
    expect(result.detail).toMatch(/\S/);
  });

  it("fails on empty text", () => {
    const result = parseGameText("");
    expect(result.ok).toBe(false);
    expect(result.line).toBe(1);
  });
});

describe("invalidReason", () => {
  it.each([
    [[], "root"],
    [null, "root"],
    ["x", "root"],
    [{}, "info"],
    [{ info: [] }, "info"],
    [{ info: { title: 5 } }, "title"],
    [{ info: {} }, "title"],
    [{ info: { title: "T" } }, null],
  ])("%j is %s", (value, reason) => {
    expect(invalidReason(value)).toBe(reason);
  });
});

describe("minimalChange", () => {
  it("is null for equal text", () => {
    expect(minimalChange("abc", "abc")).toBeNull();
  });

  it("keeps the common start and end", () => {
    expect(minimalChange("hello world", "hello brave world")).toEqual({
      from: 6,
      to: 6,
      insert: "brave ",
    });
    expect(minimalChange("abcdef", "abXef")).toEqual({
      from: 2,
      to: 4,
      insert: "X",
    });
    expect(minimalChange("aaa", "aa")).toEqual({ from: 2, to: 3, insert: "" });
  });

  it("turns the old text into the new one", () => {
    const [a, b] = ['{ "a": 1,\n "b": 2 }', '{ "a": 1,\n "b": 3, "c": 4 }'];
    const { from, to, insert } = minimalChange(a, b);
    expect(a.slice(0, from) + insert + a.slice(to)).toBe(b);
  });
});

describe("sameGame and shareUnchanged", () => {
  it("ignores the meta", () => {
    expect(sameGame({ a: 1, meta: { x: 1 } }, { a: 1 })).toBe(true);
    expect(sameGame({ a: 1 }, { a: 2 })).toBe(false);
  });

  it("keeps the references of keys that did not change", () => {
    const previous = { info: { title: "T" }, map: { a: [1] }, meta: {} };
    const next = { info: { title: "U" }, map: { a: [1] } };
    const shared = shareUnchanged(previous, next);
    expect(shared.map).toBe(previous.map);
    expect(shared.info).toBe(next.info);
    expect(shared).toEqual(next);
  });
});

describe("debounceDelay", () => {
  it("is at least the minimum and twice the last apply", () => {
    expect(debounceDelay()).toBe(MIN_DELAY);
    expect(debounceDelay(50)).toBe(MIN_DELAY);
    expect(debounceDelay(400)).toBe(800);
  });
});

describe("pointerToRange", () => {
  it("splits a pointer", () => {
    expect(pointerParts("map.hexes[0].color")).toEqual([
      "map",
      "hexes",
      "0",
      "color",
    ]);
    expect(pointerParts("")).toEqual([]);
  });

  it("finds a value", () => {
    expect(slice("map.hexes[0].color")).toBe('"red"');
    expect(slice("map.hexes[1].color")).toBe('"blue"');
    expect(slice("info.title")).toBe('"T"');
  });

  it("marks the name of a property whose value is a list or an object", () => {
    expect(slice("map.hexes")).toBe('"hexes"');
    expect(slice("map")).toBe('"map"');
  });

  it("falls back to the nearest parent that exists", () => {
    expect(slice("map.hexes[5].color")).toBe('"hexes"');
    expect(slice("map.missing.deeper")).toBe('"map"');
    expect(slice("map.hexes[*].color")).toBe('"hexes"');
  });

  it("falls back to the first line for the root and unknown names", () => {
    expect(slice("")).toBe("{");
    expect(slice("nothing")).toBe("{");
    expect(slice("", "")).toBe("");
  });
});

describe("duplicateKeys and lossyNumbers", () => {
  it("finds a name used twice", () => {
    const source = '{ "a": 1, "b": { "c": 1, "c": 2 }, "a": 3 }';
    const found = duplicateKeys(parseTree(source), source);
    expect(found.map(({ from, to }) => source.slice(from, to))).toEqual([
      '"a"',
      '"c"',
    ]);
  });

  it("finds no duplicates in a clean file", () => {
    expect(duplicateKeys(parseTree(text), text)).toEqual([]);
  });

  it("finds numbers with more digits than a double", () => {
    const source =
      "[1.0, 123456789012345, 1234567890123456789, 0.1234567890123456789, 1e300]";
    const found = lossyNumbers(parseTree(source), source);
    expect(found.map(({ from, to }) => source.slice(from, to))).toEqual([
      "1234567890123456789",
      "0.1234567890123456789",
    ]);
  });
});

describe("foldRanges", () => {
  const folded = (source) =>
    foldRanges(source).map(({ from, to }) => source.slice(from, to));

  it("folds the inside of the containers other than info", () => {
    const source =
      '{\n  "info": {\n    "a": 1\n  },\n  "map": {\n    "b": 2\n  },\n  "tiles": [\n    1\n  ]\n}';
    expect(folded(source)).toEqual(['\n    "b": 2\n  ', "\n    1\n  "]);
  });

  it("folds nothing for a list or a scalar root, or invalid text", () => {
    expect(foldRanges("[\n  1,\n  2\n]")).toEqual([]);
    expect(foldRanges("5")).toEqual([]);
    expect(foldRanges("")).toEqual([]);
  });

  it("skips empty and single line containers and scalars", () => {
    const source =
      '{\n  "a": {},\n  "b": [],\n  "c": { "x": 1 },\n  "d": 3,\n  "e": null\n}';
    expect(foldRanges(source)).toEqual([]);
  });

  it("does not fold an info that is not an object", () => {
    expect(foldRanges('{\n  "info": [\n    1\n  ]\n}')).toEqual([]);
  });

  it("skips every info", () => {
    const source =
      '{\n  "info": {\n    "a": 1\n  },\n  "info": {\n    "b": 1\n  },\n  "x": {\n    "c": 1\n  }\n}';
    expect(folded(source)).toEqual(['\n    "c": 1\n  ']);
  });
});

describe("pointerToLine", () => {
  const source = `{
  "info": { "title": "T" },
  "map": {
    "hexes": [
      { "color": "red" },
      {
        "color": "blue"
      }
    ]
  }
}`;
  const line = (pointer) => pointerToLine(parseTree(source), source, pointer);

  it("gives the line of a key", () => {
    expect(line("info")).toBe(2);
    expect(line("map")).toBe(3);
  });

  it("gives the line of a nested key", () => {
    expect(line("info.title")).toBe(2);
    expect(line("map.hexes[1].color")).toBe(7);
  });

  it("gives the line of the item for an index", () => {
    expect(line("map.hexes[0]")).toBe(5);
    expect(line("map.hexes[1]")).toBe(6);
  });

  it("falls back to the nearest parent that exists", () => {
    expect(line("map.hexes[5].color")).toBe(4);
    expect(line("map.missing.deeper")).toBe(3);
  });

  it("has no line for the root or a name that is not there", () => {
    expect(line("")).toBeNull();
    expect(line("nothing")).toBeNull();
    expect(pointerToLine(parseTree(""), "", "info")).toBeNull();
  });
});

describe("configLens", () => {
  const lens = configLens("g");

  it("edits the config of the game as an object", () => {
    expect(lens.draftKey).toBe("g#config");
    expect(lens.text({})).toBe("{}");
    expect(lens.text({ config: { margin: 1 } })).toBe(
      JSON.stringify({ margin: 1 }, null, 2),
    );
    expect(lens.same({}, {})).toBe(true);
    expect(lens.same({ config: { margin: 1 } }, { margin: 1 })).toBe(true);
    expect(lens.same({ config: { margin: 1 } }, { margin: 2 })).toBe(false);
  });

  it.each([
    [[], "config"],
    ["x", "config"],
    [null, "config"],
    [{}, null],
    [{ margin: 1 }, null],
  ])("%j is %s", (value, reason) => {
    expect(lens.invalidReason(value)).toBe(reason);
  });

  it("writes the config and keeps the other references", () => {
    const info = { title: "T" };
    const game = { info, config: { margin: 1 } };
    const next = lens.write(game, { margin: 2 });
    expect(next.config).toEqual({ margin: 2 });
    expect(next.info).toBe(info);
  });

  it("drops the key for an empty config", () => {
    const next = lens.write({ info: {}, config: { margin: 1 } }, {});
    expect("config" in next).toBe(false);
    expect(lens.write({ info: {} }, {})).toEqual({ info: {} });
  });

  it("re-roots the problems under config and leaves the others", () => {
    const issues = [
      { code: "type", pointer: "config.fonts.roles.title.size" },
      { code: "type", pointer: "config" },
      { code: "type", pointer: "configuration" },
      { code: "type", pointer: "info.title" },
    ];
    expect(lens.issues(issues, true).map((i) => i.pointer)).toEqual([
      "fonts.roles.title.size",
      "",
    ]);
    expect(lens.issues(issues, false)).toEqual([]);
  });
});
