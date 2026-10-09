import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { MAX_FILES, MAX_PNG_BYTES, MAX_SVG_BYTES } from "#util/assetNames";
import {
  createAddAsset,
  storeAsset,
  writeAssetMap,
} from "../../electron/main/addAsset.js";

import { makePng } from "@tests/support/png.js";

const SVG = '<svg viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';
const svg = (text = SVG) => new TextEncoder().encode(text);

let tmp;
let game;
let handler;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-add-asset-"));
  game = path.join(tmp, "g.json");
  fs.writeFileSync(game, "{}");
  handler = createAddAsset({
    summaryOf: (id) =>
      id === "abc" ? { path: game, type: "electron" } : undefined,
  });
});
afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

const assets = (...parts) => path.join(tmp, "g.assets", ...parts);
const add = (kind, name, bytes, options, id = "abc") =>
  handler({}, id, kind, name, bytes, options);
const code = async (promise) => (await promise.catch((e) => e)).code;
const listing = (kind) =>
  fs.existsSync(assets(kind)) ? fs.readdirSync(assets(kind)).sort() : [];

describe("the addAsset channel", () => {
  it("writes the bytes in <game>.assets/<kind>/ and gives the stored asset", async () => {
    const stored = await add("icons", "star", svg());
    expect(stored).toEqual({
      kind: "icons",
      name: "star",
      value: SVG,
      replaced: false,
    });
    expect(fs.readFileSync(assets("icons", "star.svg"), "utf8")).toBe(SVG);

    const png = makePng();
    const train = await add("trains", "loco", png);
    expect(train.value).toBe(
      `data:image/png;base64,${Buffer.from(png).toString("base64")}`,
    );
    expect(
      Buffer.compare(
        fs.readFileSync(assets("trains", "loco.png")),
        Buffer.from(png),
      ),
    ).toBe(0);
  });

  it("takes an ArrayBuffer and a view with an offset", async () => {
    const bytes = svg();
    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    );
    await add("icons", "a", buffer);
    const padded = new Uint8Array(bytes.length + 4);
    padded.set(bytes, 2);
    await add("logos", "b", padded.subarray(2, 2 + bytes.length));
    expect(fs.readFileSync(assets("icons", "a.svg"), "utf8")).toBe(SVG);
    expect(fs.readFileSync(assets("logos", "b.svg"), "utf8")).toBe(SVG);
  });

  it("leaves no temp file behind", async () => {
    await add("icons", "a", svg());
    await add("icons", "a", svg(), { replace: true });
    await code(add("icons", "a", svg()));
    expect(listing("icons")).toEqual(["a.svg"]);
  });

  describe("what it refuses", () => {
    it("a game that is not known or not a file game", async () => {
      expect(await code(add("icons", "a", svg(), undefined, "nope"))).toBe(
        "game",
      );
      expect(await code(add("icons", "a", svg(), undefined, 5))).toBe("game");
      const other = createAddAsset({
        summaryOf: () => ({ path: game, type: "internal" }),
      });
      expect(await code(other({}, "abc", "icons", "a", svg()))).toBe("game");
      expect(fs.existsSync(assets())).toBe(false);
    });

    it("a kind that is not icons, logos or trains", async () => {
      for (const kind of ["sounds", "../icons", undefined, 5, "__proto__"]) {
        expect(await code(add(kind, "a", svg()))).toBe("kind");
      }
      expect(fs.existsSync(assets())).toBe(false);
    });

    it.each([
      ["a parent folder", "../a"],
      ["a folder", "sub/a"],
      ["a backslash", "sub\\a"],
      ["an absolute path", "/etc/passwd"],
      ["dots", ".."],
      ["a hidden name", ".a"],
      ["an empty name", ""],
      ["a long name", "x".repeat(65)],
      ["a reserved name", "con"],
      ["a reserved name with an extension", "NUL.tar"],
      ["a trailing dot", "a."],
      ["a space", "a b"],
      ["a null byte", "a\0b"],
    ])("%s as a name", async (_what, name) => {
      expect(await code(add("icons", name, svg()))).toBe("name");
      expect(fs.existsSync(assets())).toBe(false);
    });

    it("a name that is not text", async () => {
      expect(await code(add("icons", 5, svg()))).toBe("name");
      expect(await code(add("icons", undefined, svg()))).toBe("name");
    });

    it("bytes that are not bytes", async () => {
      for (const bytes of ["<svg/>", null, {}, [1, 2]]) {
        expect(await code(add("icons", "a", bytes))).toBe("content");
      }
    });

    it("a file over the limit, before it is read", async () => {
      expect(
        await code(add("icons", "a", new Uint8Array(MAX_SVG_BYTES + 1))),
      ).toBe("size");
      expect(
        await code(add("trains", "a", new Uint8Array(MAX_PNG_BYTES + 1))),
      ).toBe("size");
    });

    it("a png without the signature, a bad header or a big picture", async () => {
      for (const options of [
        { signature: false },
        { width: 5000 },
        { height: 0 },
      ]) {
        expect(await code(add("trains", "a", makePng(options)))).toBe(
          "content",
        );
      }
      expect(await code(add("trains", "a", svg()))).toBe("content");
    });

    it("svg that is not a document or has script", async () => {
      for (const text of [
        "hello",
        "<svg><script/></svg>",
        '<svg onload="x()"/>',
        "<svg><foreignObject/></svg>",
        '<svg><a href="javascript:x"/></svg>',
        "<!DOCTYPE svg [<!ENTITY a 'b'>]><svg/>",
      ]) {
        expect(await code(add("icons", "a", svg(text)))).toBe("content");
      }
      expect(await code(add("icons", "a", Uint8Array.of(0x3c, 0xff)))).toBe(
        "content",
      );
      expect(fs.existsSync(assets())).toBe(false);
    });

    it("options that are not an object", async () => {
      expect(await code(add("icons", "a", svg(), "replace"))).toBe("failed");
    });
  });

  it("stores the extension in lower case", async () => {
    const stored = await add("icons", "Star", svg());
    expect(stored.name).toBe("Star");
    expect(listing("icons")).toEqual(["Star.svg"]);
  });

  describe("a name that is taken", () => {
    it("is refused without replace, also when only the case differs", async () => {
      await add("icons", "star", svg());
      expect(await code(add("icons", "star", svg("<svg><g/></svg>")))).toBe(
        "exists",
      );
      expect(await code(add("icons", "STAR", svg()))).toBe("exists");
      expect(fs.readFileSync(assets("icons", "star.svg"), "utf8")).toBe(SVG);
      expect(listing("icons")).toEqual(["star.svg"]);
    });

    it("is replaced with replace, keeping the name that was there", async () => {
      await add("icons", "star", svg());
      const stored = await add("icons", "STAR", svg("<svg><g/></svg>"), {
        replace: true,
      });
      expect(stored).toMatchObject({
        name: "star",
        value: "<svg><g/></svg>",
        replaced: true,
      });
      expect(listing("icons")).toEqual(["star.svg"]);
      expect(fs.readFileSync(assets("icons", "star.svg"), "utf8")).toBe(
        "<svg><g/></svg>",
      );
    });

    it("is a different name in another kind", async () => {
      await add("icons", "star", svg());
      await add("logos", "star", svg());
      expect(listing("logos")).toEqual(["star.svg"]);
    });

    it("lets one of two calls at the same time win", async () => {
      const results = await Promise.allSettled([
        add("icons", "same", svg("<svg><a/></svg>")),
        add("icons", "same", svg("<svg><b/></svg>")),
        add("icons", "Same", svg("<svg><c/></svg>")),
      ]);
      expect(results.map((r) => r.status)).toEqual([
        "fulfilled",
        "rejected",
        "rejected",
      ]);
      expect(results[1].reason.code).toBe("exists");
      expect(fs.readFileSync(assets("icons", "same.svg"), "utf8")).toBe(
        "<svg><a/></svg>",
      );
    });

    it("keeps the cap on the number of files across calls at the same time", async () => {
      fs.mkdirSync(assets("icons"), { recursive: true });
      for (let i = 0; i < MAX_FILES - 2; i++) {
        fs.writeFileSync(assets("icons", `i${i}.svg`), SVG);
      }
      const results = await Promise.allSettled(
        ["a", "b", "c", "d"].map((name) => add("logos", name, svg())),
      );
      expect(results.map((r) => r.status)).toEqual([
        "fulfilled",
        "fulfilled",
        "rejected",
        "rejected",
      ]);
      expect(results[2].reason.code).toBe("limit");
    });

    it("does not count the image it replaces", async () => {
      fs.mkdirSync(assets("icons"), { recursive: true });
      for (let i = 0; i < MAX_FILES; i++) {
        fs.writeFileSync(assets("icons", `i${i}.svg`), SVG);
      }
      expect(await code(add("icons", "new", svg()))).toBe("limit");
      await add("icons", "i0", svg("<svg><g/></svg>"), { replace: true });
    });
  });

  it("refuses more bytes than the game may have", async () => {
    fs.mkdirSync(assets("icons"), { recursive: true });
    const body = Buffer.from(`<svg>${"x".repeat(MAX_SVG_BYTES - 11)}</svg>`);
    for (let i = 0; i < 20; i++) {
      fs.writeFileSync(assets("icons", `i${i}.svg`), body);
    }
    expect(await code(add("logos", "a", svg()))).toBe("limit");
  });

  // Creating a link needs a privilege on Windows
  describe.skipIf(process.platform === "win32")("links", () => {
    const elsewhere = () => {
      const dir = path.join(tmp, "elsewhere");
      fs.mkdirSync(dir, { recursive: true });
      return dir;
    };

    it("refuses a symlinked assets folder", async () => {
      fs.symlinkSync(elsewhere(), assets());
      expect(await code(add("icons", "a", svg()))).toBe("folder");
      expect(fs.readdirSync(elsewhere())).toEqual([]);
    });

    it("refuses a symlinked kind folder", async () => {
      fs.mkdirSync(assets());
      fs.symlinkSync(elsewhere(), assets("icons"));
      expect(await code(add("icons", "a", svg()))).toBe("folder");
      expect(fs.readdirSync(elsewhere())).toEqual([]);
    });

    it("refuses a file in the place of a folder", async () => {
      fs.writeFileSync(assets(), "x");
      expect(await code(add("icons", "a", svg()))).toBe("folder");
      fs.rmSync(assets());
      fs.mkdirSync(assets());
      fs.writeFileSync(assets("icons"), "x");
      expect(await code(add("icons", "a", svg()))).toBe("folder");
    });

    it("refuses a symlink as the target, also a dangling one", async () => {
      fs.mkdirSync(assets("icons"), { recursive: true });
      const outside = path.join(elsewhere(), "x.svg");
      fs.symlinkSync(outside, assets("icons", "dangling.svg"));
      fs.writeFileSync(outside, "keep");
      fs.symlinkSync(outside, assets("icons", "link.svg"));

      for (const name of ["dangling", "link"]) {
        expect(await code(add("icons", name, svg()))).toBe("unsafe");
        expect(await code(add("icons", name, svg(), { replace: true }))).toBe(
          "unsafe",
        );
      }
      expect(fs.readFileSync(outside, "utf8")).toBe("keep");
    });

    it("refuses a hard link as the file to replace", async () => {
      fs.mkdirSync(assets("icons"), { recursive: true });
      const outside = path.join(elsewhere(), "x.svg");
      fs.writeFileSync(outside, "keep");
      fs.linkSync(outside, assets("icons", "hard.svg"));
      expect(await code(add("icons", "hard", svg(), { replace: true }))).toBe(
        "unsafe",
      );
      expect(fs.readFileSync(outside, "utf8")).toBe("keep");
    });

    it("refuses a folder as the target", async () => {
      fs.mkdirSync(assets("icons", "dir.svg"), { recursive: true });
      expect(await code(add("icons", "dir", svg(), { replace: true }))).toBe(
        "unsafe",
      );
    });
  });

  describe("file system errors", () => {
    const failing = (method, errno) => {
      const fake = { ...fs };
      fake[method] = (...args) => {
        if (args[0] && String(args[0]).includes("g.assets")) {
          throw Object.assign(new Error(errno), { code: errno });
        }
        return fs[method](...args);
      };
      return createAddAsset({
        summaryOf: () => ({ path: game, type: "electron" }),
        fs: fake,
      });
    };

    it.each([
      ["mkdirSync", "EACCES", "denied"],
      ["mkdirSync", "EROFS", "readonly"],
      ["writeFileSync", "ENOSPC", "full"],
      ["writeFileSync", "EIO", "failed"],
    ])("maps %s %s to %s", async (method, errno, expected) => {
      const handle = failing(method, errno);
      expect(await code(handle({}, "abc", "icons", "a", svg()))).toBe(expected);
    });

    it("writes the file itself when the volume has no hard links", async () => {
      const fake = {
        ...fs,
        linkSync: () => {
          throw Object.assign(new Error("no"), { code: "EPERM" });
        },
      };
      const handle = createAddAsset({
        summaryOf: () => ({ path: game, type: "electron" }),
        fs: fake,
      });
      await handle({}, "abc", "icons", "a", svg());
      expect(listing("icons")).toEqual(["a.svg"]);
      expect(await code(handle({}, "abc", "icons", "a", svg()))).toBe("exists");
    });

    it("carries the code in the message, for the preload", async () => {
      const error = await add("sounds", "a", svg()).catch((e) => e);
      expect(error.message).toBe("asset:kind");
    });
  });
});

describe("writeAssetMap", () => {
  it("writes every image of an asset map, replacing what is there", () => {
    const png = makePng();
    const map = {
      icons: { star: SVG },
      logos: { crest: SVG },
      trains: {
        loco: `data:image/png;base64,${Buffer.from(png).toString("base64")}`,
      },
    };
    writeAssetMap(game, map);
    writeAssetMap(game, map);
    expect(listing("icons")).toEqual(["star.svg"]);
    expect(listing("logos")).toEqual(["crest.svg"]);
    expect(
      Buffer.compare(
        fs.readFileSync(assets("trains", "loco.png")),
        Buffer.from(png),
      ),
    ).toBe(0);
  });

  it("throws for an image that is not valid", () => {
    expect(() => writeAssetMap(game, { icons: { "a b": SVG } })).toThrow(
      /asset:name/,
    );
    expect(() =>
      storeAsset({ gamePath: game, kind: "x", name: "a", bytes: svg() }),
    ).toThrow(/asset:kind/);
  });
});
