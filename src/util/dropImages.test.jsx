import {
  captureFiles,
  errorCode,
  freeName,
  isGameDrop,
} from "@/util/dropImages";

const file = (name) => ({ name });

describe("errorCode", () => {
  it.each([
    [{ code: "quota" }, "quota"],
    [
      new Error("Error invoking remote method 'addAsset': Error: exists"),
      "exists",
    ],
    [new Error("ENOENT"), "unreadable"],
    [{ code: "weird" }, "unreadable"],
    [new Error("asset:exists custom/star exists"), "exists"],
    [{ message: "asset:game", code: "game" }, "notfound"],
    [new Error("asset:content not svg"), "svg"],
    [new Error("asset:limit"), "count"],
    [{ code: "denied" }, "readonly"],
    [new Error("asset:full"), "quota"],
    [undefined, "unreadable"],
  ])("reads %j as %s", (error, code) => {
    expect(errorCode(error)).toBe(code);
  });
});

describe("isGameDrop", () => {
  it("is a game for one json file, any case", () => {
    expect(isGameDrop([{ file: file("g.JSON") }])).toBe(true);
    expect(isGameDrop([{ file: undefined }])).toBe(true);
    expect(isGameDrop([])).toBe(true);
  });

  it("is images for anything else", () => {
    expect(isGameDrop([{ file: file("a.svg") }])).toBe(false);
    expect(isGameDrop([{ file: file("a.txt") }])).toBe(false);
    expect(
      isGameDrop([{ file: file("a.json") }, { file: file("b.png") }]),
    ).toBe(false);
    expect(isGameDrop([{ file: file("dir.json"), directory: true }])).toBe(
      false,
    );
  });
});

describe("freeName", () => {
  it("numbers a name that is taken, case aside", () => {
    expect(freeName(["star", "Star-2"], "STAR")).toBe("STAR-3");
    expect(freeName([], "star")).toBe("star");
  });

  it("keeps the numbered name within the length", () => {
    expect(freeName(["a".repeat(64)], "a".repeat(64))).toHaveLength(62);
  });
});

describe("captureFiles", () => {
  it("reads items before anything else, and skips what is not a file", () => {
    const a = file("a.svg");
    const found = captureFiles({
      items: [
        { kind: "string" },
        { kind: "file", getAsFile: () => a },
        {
          kind: "file",
          getAsFile: () => file("d"),
          webkitGetAsEntry: () => ({ isDirectory: true }),
        },
        {
          kind: "file",
          getAsFile: () => {
            throw new Error("gone");
          },
        },
      ],
    });

    expect(found).toEqual([
      { file: a, directory: false },
      { file: { name: "d" }, directory: true },
      { file: undefined, directory: false },
    ]);
  });

  it("falls back to the files of the transfer", () => {
    expect(captureFiles({ files: [file("x.png")] })).toEqual([
      { file: { name: "x.png" }, directory: false },
    ]);
    expect(captureFiles(undefined)).toEqual([]);
  });
});
