import {
  KINDS,
  MAX_PNG_DIMENSION,
  MAX_SVG_BYTES,
  assetBytes,
  assetProblem,
  assetTotals,
  assetsFolder,
  checkPng,
  customId,
  customName,
  emptyAssets,
  extensionOf,
  findDuplicate,
  isCustomId,
  isReservedName,
  isValidName,
  kindsOfExtension,
  nameProblem,
  pngBytes,
  pngDataUri,
  sameName,
  sanitizeName,
} from "@/util/assetNames";

import { makePng } from "@tests/support/png.js";

describe("custom image names", () => {
  it.each(["star", "Star-2", "a.b_c", "1", "x".repeat(64)])(
    "accepts %s",
    (name) => {
      expect(nameProblem(name)).toBeNull();
      expect(isValidName(name)).toBe(true);
    },
  );

  it.each([
    ["", "empty"],
    [undefined, "empty"],
    ["x".repeat(65), "long"],
    ["-star", "invalid"],
    [".hidden", "invalid"],
    ["_a", "invalid"],
    ["a/b", "invalid"],
    ["a\\b", "invalid"],
    ["..", "invalid"],
    ["a b", "invalid"],
    ["name.", "invalid"],
    ["é", "invalid"],
    ["con", "reserved"],
    ["CON", "reserved"],
    ["nul.tar", "reserved"],
    ["Com1", "reserved"],
    ["lpt9", "reserved"],
  ])("refuses %j as %s", (name, problem) => {
    expect(nameProblem(name)).toBe(problem);
  });

  it("does not take names like CONSOLE or COM10 as reserved", () => {
    expect(isReservedName("console")).toBe(false);
    expect(isReservedName("com10")).toBe(false);
  });

  it("compares names without case", () => {
    expect(sameName("Foo", "foo")).toBe(true);
    expect(sameName("foo", "bar")).toBe(false);
    expect(findDuplicate(["a", "Foo"], "foo")).toBe("Foo");
    expect(findDuplicate(["a"], "b")).toBeUndefined();
  });

  it("makes a name of a file name", () => {
    expect(sanitizeName("My Star!.svg")).toBe("My-Star-");
    expect(sanitizeName("C:\\pics\\logo.SVG")).toBe("logo");
    expect(sanitizeName("--x.svg")).toBe("x");
    expect(sanitizeName("é.svg")).toBe("image");
    expect(sanitizeName("con.svg")).toBe("image");
    expect(sanitizeName(".svg")).toBe("image");
    expect(sanitizeName("")).toBe("image");
    expect(sanitizeName(`${"a".repeat(100)}.png`)).toHaveLength(64);
    for (const file of ["a b.svg", "ü.png", "x".repeat(200), "..", "nul"]) {
      expect(isValidName(sanitizeName(file))).toBe(true);
    }
  });

  it("lower-cases the extension", () => {
    expect(extensionOf("A.SVG")).toBe("svg");
    expect(extensionOf("a.tar.PNG")).toBe("png");
    expect(extensionOf("noext")).toBe("");
    expect(kindsOfExtension("svg")).toEqual(["icons", "logos"]);
    expect(kindsOfExtension("png")).toEqual(["trains"]);
    expect(kindsOfExtension("gif")).toEqual([]);
  });

  it("knows custom ids", () => {
    expect(customId("star")).toBe("custom/star");
    expect(isCustomId("custom/star")).toBe(true);
    expect(isCustomId("boat")).toBe(false);
    expect(isCustomId(undefined)).toBe(false);
    expect(customName("custom/star")).toBe("star");
    expect(customName("boat")).toBeUndefined();
  });

  it("puts the images of a game file next to it", () => {
    expect(assetsFolder("/games/18Test.json")).toBe("/games/18Test.assets");
    expect(assetsFolder("C:\\games\\x.JSON")).toBe("C:\\games\\x.assets");
    expect(assetsFolder("/games/noext")).toBe("/games/noext.assets");
  });
});

describe("custom image files", () => {
  it("accepts a PNG with its signature and header", () => {
    expect(checkPng(makePng({ width: 3, height: 5 }))).toEqual({
      ok: true,
      width: 3,
      height: 5,
    });
  });

  it("refuses a bad signature, a short file and a bad header", () => {
    expect(checkPng(makePng({ signature: false }))).toMatchObject({
      ok: false,
      reason: "signature",
    });
    expect(checkPng(new Uint8Array(10))).toMatchObject({ reason: "signature" });
    const png = makePng();
    png[12] = 0x58; // IHDR -> XHDR
    expect(checkPng(png)).toMatchObject({ reason: "header" });
  });

  it("refuses a picture larger than the limit or with no size", () => {
    expect(
      checkPng(makePng({ width: MAX_PNG_DIMENSION + 1, height: 1 })),
    ).toMatchObject({ ok: false, reason: "dimensions" });
    expect(
      checkPng(makePng({ width: 1, height: MAX_PNG_DIMENSION + 1 })),
    ).toMatchObject({ reason: "dimensions" });
    expect(
      checkPng(
        makePng({ width: MAX_PNG_DIMENSION, height: MAX_PNG_DIMENSION }),
      ),
    ).toMatchObject({ ok: true });
    expect(checkPng(makePng({ width: 0, height: 1 }))).toMatchObject({
      reason: "dimensions",
    });
  });

  it("finds why a file is not an image of a kind", () => {
    const png = makePng();
    expect(assetProblem("trains", "loco", png)).toBeNull();
    expect(assetProblem("trains", "loco", makePng({ signature: false }))).toBe(
      "signature",
    );
    expect(assetProblem("icons", "star", new Uint8Array(10))).toBeNull();
    expect(
      assetProblem("icons", "star", new Uint8Array(MAX_SVG_BYTES + 1)),
    ).toBe("size");
    expect(assetProblem("icons", "con", new Uint8Array(1))).toBe("reserved");
    expect(assetProblem("sounds", "x", new Uint8Array(1))).toBe("kind");
  });

  it("round trips PNG bytes through a data uri", () => {
    for (const size of [1, 2, 3, 4, 100]) {
      const bytes = Uint8Array.from({ length: size }, (_, i) => (i * 37) % 256);
      const uri = pngDataUri(bytes);
      expect(uri).toBe(
        `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`,
      );
      expect(Array.from(pngBytes(uri))).toEqual(Array.from(bytes));
      expect(assetBytes("trains", uri)).toBe(size);
    }
  });

  it("counts the files and bytes of a map", () => {
    const assets = emptyAssets();
    assets.icons.a = "<svg/>é";
    assets.trains.t = pngDataUri(new Uint8Array(10));
    expect(assetTotals(assets)).toEqual({ count: 2, bytes: 8 + 10 });
    expect(assetTotals(undefined)).toEqual({ count: 0, bytes: 0 });
    expect(KINDS).toEqual(["icons", "logos", "trains"]);
  });
});
