import { gameText } from "@/util/download";
import { diffGames, diffText } from "@/util/gameDiff";

const game = (extra = {}) => ({
  info: { title: "T" },
  meta: { id: "a", type: "system", slug: "system:a" },
  ...extra,
});

describe("gameText", () => {
  it("is the saved file: no meta, 2 spaces", () => {
    expect(gameText(game())).toBe('{\n  "info": {\n    "title": "T"\n  }\n}');
  });
});

describe("diffGames", () => {
  it("is empty for the same game, whatever the meta", () => {
    const other = { ...game(), meta: { id: "b", type: "internal", slug: "x" } };
    expect(diffGames(game(), other)).toEqual({
      hunks: [],
      added: 0,
      removed: 0,
    });
  });

  it("finds an added line", () => {
    const result = diffGames(game(), game({ n: 1 }));
    // The closing brace of info gains a comma
    expect(result).toMatchObject({ added: 2, removed: 1 });
    expect(result.hunks).toHaveLength(1);
  });

  it("finds a changed value as a delete and an add with line numbers", () => {
    const result = diffGames(game({ n: 1 }), game({ n: 2 }));
    const [del] = result.hunks[0].filter((l) => l.type === "delete");
    const [add] = result.hunks[0].filter((l) => l.type === "add");
    expect(del).toMatchObject({ text: '  "n": 1', oldLine: 5, newLine: null });
    expect(add).toMatchObject({ text: '  "n": 2', oldLine: null, newLine: 5 });
    expect(result).toMatchObject({ added: 1, removed: 1 });
  });

  it("finds a removed key", () => {
    const result = diffGames(game({ n: 1 }), game());
    expect(result.removed).toBe(2);
    expect(result.added).toBe(1);
  });
});

describe("diffText hunks", () => {
  const numbered = (n, changed = []) =>
    Array.from({ length: n }, (_, i) =>
      changed.includes(i + 1) ? `changed ${i + 1}` : `line ${i + 1}`,
    ).join("\n") + "\n";

  it("keeps 3 lines of context around a change", () => {
    const { hunks } = diffText(numbered(20), numbered(20, [10]));
    expect(hunks).toHaveLength(1);
    expect(hunks[0].map((l) => l.text)).toEqual([
      "line 7",
      "line 8",
      "line 9",
      "line 10",
      "changed 10",
      "line 11",
      "line 12",
      "line 13",
    ]);
  });

  it("splits far apart changes into hunks and joins close ones", () => {
    expect(diffText(numbered(30), numbered(30, [3, 25])).hunks).toHaveLength(2);
    expect(diffText(numbered(30), numbered(30, [3, 8])).hunks).toHaveLength(1);
  });
});
