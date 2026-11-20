import { describe, expect, it, vi } from "vitest";

import { loadAssets } from "@/play/client/assets";
import { MAX_SVG_BYTES, pngDataUri } from "@/util/assetNames";
import { sanitizeSvg } from "@/util/svgSanitize";

import { makePng } from "@tests/support/png.js";

// A browser test (sanitizeAssets parses SVG with DOMParser, not in Node)
const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';
const PNG = makePng();
const svgBlob = (text = SVG) => new Blob([text], { type: "image/svg+xml" });
const pngBlob = (bytes = PNG) => new Blob([bytes], { type: "image/png" });

const server = (files) =>
  vi.fn(async (name) => {
    if (!Object.hasOwn(files, name)) throw new Error("Not found");
    return files[name];
  });

describe("loadAssets", () => {
  it("groups the names by kind, split on the first dot", async () => {
    const fetchAsset = server({
      "icons.star": svgBlob(),
      "logos.b.and.o": svgBlob(),
      "trains.loco.v2": pngBlob(),
    });
    const assets = await loadAssets({
      fetchAsset,
      names: ["icons.star", "logos.b.and.o", "trains.loco.v2"],
    });
    expect(Object.keys(assets.icons)).toEqual(["star"]);
    expect(Object.keys(assets.logos)).toEqual(["b.and.o"]);
    expect(Object.keys(assets.trains)).toEqual(["loco.v2"]);
  });

  it("keeps an SVG as text and a PNG as a data URI", async () => {
    const assets = await loadAssets({
      fetchAsset: server({ "icons.star": svgBlob(), "trains.loco": pngBlob() }),
      names: ["icons.star", "trains.loco"],
    });
    expect(assets.icons.star).toBe(SVG);
    expect(assets.trains.loco).toBe(pngDataUri(PNG));
  });

  it("fetches at most four at once", async () => {
    let inFlight = 0;
    let most = 0;
    const fetchAsset = vi.fn(async () => {
      inFlight += 1;
      most = Math.max(most, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return svgBlob();
    });
    const names = Array.from({ length: 10 }, (_, i) => `icons.i${i}`);
    const assets = await loadAssets({ fetchAsset, names });
    expect(fetchAsset).toHaveBeenCalledTimes(10);
    expect(most).toBe(4);
    expect(Object.keys(assets.icons)).toHaveLength(10);
  });

  it("skips an asset whose fetch rejects and loads the others", async () => {
    const assets = await loadAssets({
      fetchAsset: server({ "icons.star": svgBlob() }),
      names: ["icons.gone", "icons.star"],
    });
    expect(Object.keys(assets.icons)).toEqual(["star"]);
  });

  it("skips malformed and oversize assets", async () => {
    const big = `<svg xmlns="http://www.w3.org/2000/svg"><!--${"x".repeat(MAX_SVG_BYTES)}--></svg>`;
    const assets = await loadAssets({
      fetchAsset: server({
        "icons.junk": svgBlob("not an svg"),
        "icons.big": svgBlob(big),
        "trains.fake": pngBlob(new Uint8Array([1, 2, 3, 4])),
        "icons.ok": svgBlob(),
      }),
      names: ["icons.junk", "icons.big", "trains.fake", "icons.ok"],
    });
    expect(Object.keys(assets.icons)).toEqual(["ok"]);
    expect(assets.trains).toEqual({});
  });

  it("draws only the safe parts of a script-bearing SVG", async () => {
    const evil =
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect onload="alert(1)" width="1" height="1"/></svg>';
    const assets = await loadAssets({
      fetchAsset: server({ "icons.evil": svgBlob(evil) }),
      names: ["icons.evil"],
    });
    // Kept as text the sanitizer accepts: CustomSvg draws its allowlist tree,
    // which has the rect but never the script or the handler
    const tree = JSON.stringify(sanitizeSvg(assets.icons.evil));
    expect(tree).toMatch(/rect/);
    expect(tree).not.toMatch(/script|onload|alert/);
  });

  it("drops an SVG with nothing safe to draw", async () => {
    const assets = await loadAssets({
      fetchAsset: server({
        "icons.html": svgBlob("<html><script>alert(1)</script></html>"),
      }),
      names: ["icons.html"],
    });
    expect(assets.icons).toEqual({});
  });

  it("ignores unknown kinds and names with no kind", async () => {
    const fetchAsset = server({ "fonts.x": svgBlob(), "icons.ok": svgBlob() });
    const assets = await loadAssets({
      fetchAsset,
      names: ["fonts.x", "nodot", "icons.ok", "icons.bad name"],
    });
    expect(fetchAsset).not.toHaveBeenCalledWith("fonts.x");
    expect(fetchAsset).not.toHaveBeenCalledWith("nodot");
    expect(assets.icons).toEqual({ ok: SVG });
    expect(Object.keys(assets)).toEqual(["icons", "logos", "trains"]);
  });

  it("gives an empty map for no names", async () => {
    const fetchAsset = vi.fn();
    expect(await loadAssets({ fetchAsset, names: [] })).toEqual({
      icons: {},
      logos: {},
      trains: {},
    });
    expect(await loadAssets({ fetchAsset })).toEqual({
      icons: {},
      logos: {},
      trains: {},
    });
    expect(fetchAsset).not.toHaveBeenCalled();
  });
});
