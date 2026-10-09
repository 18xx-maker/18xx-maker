import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  assetsProblem,
  loadAssetFolder,
  loadAssetsFrom,
  readAsset,
  svgText,
} from "#export/assets";
import {
  MAX_FILES,
  MAX_PNG_BYTES,
  MAX_SVG_BYTES,
  MAX_TOTAL_BYTES,
} from "#util/assetNames";

import { makePng } from "@tests/support/png.js";

const SVG = '<svg viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';

let tmp;
let root;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-assets-"));
  root = path.join(tmp, "g.assets");
});
afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

const put = (kind, name, content) => {
  fs.mkdirSync(path.join(root, kind), { recursive: true });
  fs.writeFileSync(path.join(root, kind, name), content);
};
const load = () => loadAssetFolder(path.join(tmp, "g.json"));
const warned = (result, text) =>
  result.warnings.some((warning) => warning.includes(text));

describe("loadAssetFolder", () => {
  it("is empty and quiet when the folder is not there", () => {
    const result = load();
    expect(result.count).toBe(0);
    expect(result.warnings).toEqual([]);
    expect(result.assets.icons).toEqual({});
  });

  it("reads icons, logos and trains by name without the extension", () => {
    const png = makePng();
    put("icons", "star.svg", SVG);
    put("logos", "Crest.svg", SVG);
    put("trains", "loco.png", png);

    const { assets, count, warnings } = load();

    expect(warnings).toEqual([]);
    expect(count).toBe(3);
    expect(assets.icons.star).toBe(SVG);
    expect(assets.logos.Crest).toBe(SVG);
    expect(assets.trains.loco).toBe(
      `data:image/png;base64,${Buffer.from(png).toString("base64")}`,
    );
  });

  it("takes upper case extensions, a BOM and an XML declaration", () => {
    put(
      "icons",
      "a.SVG",
      `${String.fromCharCode(0xfeff)}<?xml version="1.0"?>\n<!-- x -->\n${SVG}`,
    );
    const result = load();
    expect(Object.keys(result.assets.icons)).toEqual(["a"]);
    expect(result.assets.icons.a.startsWith("<?xml")).toBe(true);
  });

  it.each([
    ["traversal", "..svg"],
    ["a leading dot", ".hidden.svg"],
    ["a space", "a b.svg"],
    ["a reserved name", "con.svg"],
    ["a long name", `${"x".repeat(65)}.svg`],
  ])("skips %s", (_what, name) => {
    put("icons", name, SVG);
    put("icons", "ok.svg", SVG);
    const result = load();
    expect(Object.keys(result.assets.icons)).toEqual(["ok"]);
  });

  it("warns about a name that is not usable", () => {
    put("icons", "a b.svg", SVG);
    expect(warned(load(), "the name is not usable")).toBe(true);
  });

  it("only takes svg for icons and logos and png for trains", () => {
    put("icons", "a.png", makePng());
    put("trains", "b.svg", SVG);
    put("logos", "c.txt", "x");
    const result = load();
    expect(result.count).toBe(0);
    expect(result.warnings).toHaveLength(3);
  });

  it("skips a png without the signature, a bad header and a big image", () => {
    put("trains", "nosig.png", makePng({ signature: false }));
    put("trains", "wide.png", makePng({ width: 5000 }));
    put("trains", "ok.png", makePng());
    const result = load();
    expect(Object.keys(result.assets.trains)).toEqual(["ok"]);
    expect(warned(result, "nosig.png: not a valid image (signature)")).toBe(
      true,
    );
    expect(warned(result, "wide.png: not a valid image (dimensions)")).toBe(
      true,
    );
  });

  it("skips svg that is not a document, not UTF-8 or has script", () => {
    put("icons", "text.svg", "hello");
    put("icons", "latin.svg", Buffer.from([0x3c, 0xff, 0xfe]));
    put("icons", "script.svg", "<svg><script>alert(1)</script></svg>");
    put("icons", "onload.svg", '<svg onload="x()"/>');
    put("icons", "fo.svg", "<svg><foreignObject/></svg>");
    put("icons", "js.svg", '<svg><a href="javascript:x"/></svg>');
    put("icons", "ok.svg", SVG);
    const result = load();
    expect(Object.keys(result.assets.icons)).toEqual(["ok"]);
    expect(result.warnings).toHaveLength(6);
  });

  it("skips a file over the limit of its kind", () => {
    put("icons", "big.svg", `<svg>${" ".repeat(MAX_SVG_BYTES)}</svg>`);
    put("trains", "big.png", Buffer.alloc(MAX_PNG_BYTES + 1));
    const result = load();
    expect(result.count).toBe(0);
    expect(result.warnings).toHaveLength(2);
  });

  it("skips a name that only differs in case", () => {
    put("icons", "Star.svg", SVG);
    put("icons", "star.svg", SVG);
    // A case-insensitive file system (macOS, Windows) holds only one
    if (fs.readdirSync(path.join(root, "icons")).length < 2) return;
    const result = load();
    // Sorted, so the first one stays
    expect(Object.keys(result.assets.icons)).toEqual(["Star"]);
    expect(warned(result, "star.svg: same name")).toBe(true);
  });

  it("stops at the number of files", () => {
    for (let i = 0; i < MAX_FILES + 3; i++) put("icons", `i${i}.svg`, SVG);
    const result = load();
    expect(result.count).toBe(MAX_FILES);
    expect(result.warnings).toHaveLength(3);
  });

  it("stops at the total size", () => {
    const body = "x".repeat(MAX_SVG_BYTES - 20);
    const files = Math.ceil(MAX_TOTAL_BYTES / (MAX_SVG_BYTES - 7)) + 1;
    for (let i = 0; i < files; i++) {
      put("icons", `i${String(i).padStart(2, "0")}.svg`, `<svg>${body}</svg>`);
    }
    const result = load();
    expect(result.count).toBeLessThan(files);
    expect(warned(result, "total size")).toBe(true);
  });

  it("ignores hidden files, such as .DS_Store and temp files", () => {
    put("icons", ".DS_Store", "x");
    put("icons", ".abc.tmp", SVG);
    expect(load().warnings).toEqual([]);
  });

  describe("links", () => {
    const outside = () => {
      const file = path.join(tmp, "outside.svg");
      fs.writeFileSync(file, SVG);
      return file;
    };

    it("skips a symlinked file", () => {
      put("icons", "ok.svg", SVG);
      fs.symlinkSync(outside(), path.join(root, "icons", "link.svg"));
      const result = load();
      expect(Object.keys(result.assets.icons)).toEqual(["ok"]);
      expect(warned(result, "links are ignored")).toBe(true);
    });

    it("skips a dangling symlink", () => {
      put("icons", "ok.svg", SVG);
      fs.symlinkSync(
        path.join(tmp, "nothing.svg"),
        path.join(root, "icons", "dangling.svg"),
      );
      expect(Object.keys(load().assets.icons)).toEqual(["ok"]);
    });

    it("skips a symlinked icons folder", () => {
      const real = path.join(tmp, "real-icons");
      fs.mkdirSync(real);
      fs.writeFileSync(path.join(real, "a.svg"), SVG);
      fs.mkdirSync(root);
      fs.symlinkSync(real, path.join(root, "icons"));
      put("logos", "l.svg", SVG);
      const result = load();
      expect(result.assets.icons).toEqual({});
      expect(Object.keys(result.assets.logos)).toEqual(["l"]);
      expect(warned(result, "icons: not a folder")).toBe(true);
    });

    it("skips a symlinked assets folder", () => {
      const real = path.join(tmp, "real.assets");
      fs.mkdirSync(path.join(real, "icons"), { recursive: true });
      fs.writeFileSync(path.join(real, "icons", "a.svg"), SVG);
      fs.symlinkSync(real, root);
      const result = load();
      expect(result.count).toBe(0);
      expect(warned(result, "not a folder")).toBe(true);
    });

    it("skips a folder or a file in the place of the assets folder", () => {
      fs.writeFileSync(root, "x");
      expect(load().count).toBe(0);
      expect(load().warnings).toHaveLength(1);
    });

    it("skips a folder named like an image", () => {
      fs.mkdirSync(path.join(root, "icons", "dir.svg"), { recursive: true });
      const result = load();
      expect(result.count).toBe(0);
      expect(warned(result, "not a file")).toBe(true);
    });
  });
});

describe("loadAssetsFrom", () => {
  it("reads a folder by its own path", () => {
    put("icons", "a.svg", SVG);
    expect(loadAssetsFrom(root).count).toBe(1);
  });

  it("reports a read error as a warning", () => {
    put("icons", "a.svg", SVG);
    const fake = {
      ...fs,
      readdirSync: () => {
        throw new Error("EIO");
      },
    };
    const result = loadAssetsFrom(root, { fs: fake });
    expect(result.count).toBe(0);
    expect(warned(result, "EIO")).toBe(true);
  });
});

describe("readAsset and svgText", () => {
  it("gives the value or the reason", () => {
    expect(readAsset("icons", "a", Buffer.from(SVG))).toEqual({ value: SVG });
    expect(readAsset("icons", "a b", Buffer.from(SVG))).toEqual({
      problem: "invalid",
    });
    expect(readAsset("trains", "a", Buffer.from("png"))).toEqual({
      problem: "signature",
    });
    expect(svgText(Buffer.from("<html/>"))).toEqual({ problem: "root" });
  });
});

describe("assetsProblem", () => {
  const png = `data:image/png;base64,${Buffer.from(makePng()).toString("base64")}`;
  const good = { icons: { a: SVG }, logos: {}, trains: { t: png } };

  it("accepts a map", () => {
    expect(assetsProblem(good)).toBeNull();
    expect(assetsProblem({})).toBeNull();
  });

  it.each([
    ["not an object", null],
    ["an array", []],
    ["an unknown kind", { sounds: {} }],
    ["a kind that is no object", { icons: [] }],
    ["a bad name", { icons: { "../a": SVG } }],
    ["a value that is no text", { icons: { a: 1 } }],
    ["a train that is no png data", { trains: { a: "http://x/a.png" } }],
    ["a big svg", { icons: { a: "x".repeat(MAX_SVG_BYTES + 1) } }],
  ])("refuses %s", (_what, assets) => {
    expect(assetsProblem(assets)).toEqual(expect.any(String));
  });

  it("refuses too many files and too much in all", () => {
    const many = Object.fromEntries(
      Array.from({ length: MAX_FILES + 1 }, (_, i) => [`i${i}`, SVG]),
    );
    expect(assetsProblem({ icons: many })).toMatch(/more than/);
    const big = Object.fromEntries(
      Array.from({ length: 21 }, (_, i) => [
        `i${i}`,
        "x".repeat(MAX_SVG_BYTES),
      ]),
    );
    expect(assetsProblem({ icons: big })).toMatch(/total/);
  });
});
