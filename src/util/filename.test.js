import { MAX_FILENAME, sanitizeFilename } from "@/util/filename";

describe("sanitizeFilename", () => {
  it("keeps a plain name and drops one .json", () => {
    expect(sanitizeFilename("my game")).toBe("my game");
    expect(sanitizeFilename("my-game.json")).toBe("my-game");
    expect(sanitizeFilename("a.json.json")).toBe("a.json");
    expect(sanitizeFilename("My.JSON")).toBe("My");
  });

  it("strips the path", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("C:\\Users\\me\\game.json")).toBe("game");
    expect(sanitizeFilename("a/")).toBe("");
  });

  it("strips reserved and control characters and leading dots", () => {
    expect(sanitizeFilename('a<b>c:d"e|f?g*h')).toBe("abcdefgh");
    expect(sanitizeFilename("a\u0000b\nc")).toBe("abc");
    expect(sanitizeFilename("...hidden")).toBe("hidden");
    expect(sanitizeFilename("name. . ")).toBe("name");
  });

  it("gives nothing for names that are not usable", () => {
    expect(sanitizeFilename("")).toBe("");
    expect(sanitizeFilename("   ")).toBe("");
    expect(sanitizeFilename(".json")).toBe("");
    expect(sanitizeFilename("???")).toBe("");
    expect(sanitizeFilename(undefined)).toBe("");
    for (const name of ["CON", "nul.json", "Com1", "lpt9.txt", "aux"]) {
      expect(sanitizeFilename(name)).toBe("");
    }
    expect(sanitizeFilename("console")).toBe("console");
  });

  it("caps the length", () => {
    expect(sanitizeFilename("a".repeat(500))).toHaveLength(MAX_FILENAME);
  });

  it("keeps only characters that are safe in a URL when asked", () => {
    const options = { urlSafe: true };
    expect(sanitizeFilename("a#b%c?d&e:f", options)).toBe("abcdef");
    expect(sanitizeFilename("my game_1.2-x.json", options)).toBe(
      "my game_1.2-x",
    );
    expect(sanitizeFilename("#%?&:", options)).toBe("");
  });

  it("keeps letters and digits of other scripts", () => {
    expect(sanitizeFilename("新建游戏 2", { urlSafe: true })).toBe(
      "新建游戏 2",
    );
    expect(sanitizeFilename("Straße Ärger", { urlSafe: true })).toBe(
      "Straße Ärger",
    );
  });
});
