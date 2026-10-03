import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { decodePng } from "../src/export/__fixtures__/png.js";
import { readPng } from "../src/export/png.js";
import { OPAQUE, edgeAlpha, edgeColors, unzip } from "./export-files.js";

// maker export against the built site (dist/site), for 18Test, in a browser of
// its own. The sizes and page counts are the golden values of 18Test.
const bin = path.resolve(import.meta.dirname, "../bin/maker.js");
const fixture = path.resolve(import.meta.dirname, "fixtures/e2e-game.json");

const maker = (out, ...args) =>
  spawnSync(process.execPath, [bin, "export", ...args, "--out", out], {
    cwd: out,
    encoding: "utf-8",
  });

const png = (file) => readPng(new Uint8Array(fs.readFileSync(file)));
const pages = (file) =>
  [
    ...fs
      .readFileSync(file)
      .toString("latin1")
      .matchAll(/\/Type\s*\/Page\b(?!s)/g),
  ].length;

// The alpha of the top left pixel of a png, read by the browser
const cornerAlpha = (page, file) =>
  page.evaluate(async (base64) => {
    const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
    const canvas = new OffscreenCanvas(1, 1);
    const context = canvas.getContext("2d");
    context.drawImage(await createImageBitmap(blob), 0, 0);
    return context.getImageData(0, 0, 1, 1).data[3];
  }, fs.readFileSync(file).toString("base64"));

let out;

test.beforeEach(() => {
  out = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-e2e-cli-"));
});

test.afterEach(() => {
  fs.rmSync(out, { recursive: true, force: true });
});

test.describe("maker export 18Test", () => {
  test.setTimeout(120_000);

  test("writes pdf, png and a Board 18 box", () => {
    const result = maker(
      out,
      "18Test",
      "--format",
      "pdf,png,b18",
      "--docs",
      "background,map",
    );
    expect(result.status, result.stderr).toBe(0);

    const dir = path.join(out, "18Test");
    expect(pages(path.join(dir, "18test-map.pdf"))).toBe(1);
    expect(pages(path.join(dir, "18test-map-paginated.pdf"))).toBe(2);

    // 8 by 10.5 inches at 300 dpi, with its resolution of 11811 pixels/meter
    expect(png(path.join(dir, "18test-background.png"))).toEqual({
      width: 2400,
      height: 3150,
      pixelsPerMeter: 11811,
    });
    expect(png(path.join(dir, "18test-map.png")).width).toBe(4500);

    // Board 18 images are one pixel for each unit, without a resolution
    const box = path.join(dir, "board18-18Test-1.0");
    expect(fs.readdirSync(path.join(box, "18Test-1.0")).sort()).toEqual(
      expect.arrayContaining(["Map.png", "Market.png", "Tokens.png"]),
    );
    expect(png(path.join(box, "18Test-1.0/Tokens.png"))).toEqual({
      width: 60,
      height: 1080,
      pixelsPerMeter: null,
    });
    expect(
      JSON.parse(fs.readFileSync(path.join(box, "18Test-1.0.json"), "utf-8")),
    ).toMatchObject({ bname: "18Test", version: "1.0" });
    expect(fs.existsSync(`${box}.zip`)).toBe(true);
  });

  test("writes png at a lower dpi", () => {
    const result = maker(
      out,
      "18Test",
      "--format",
      "png",
      "--docs",
      "background",
      "--dpi",
      "150",
    );
    expect(result.status, result.stderr).toBe(0);

    expect(png(path.join(out, "18Test/18test-background.png"))).toEqual({
      width: 1200,
      height: 1575,
      pixelsPerMeter: 5906,
    });
  });

  test("writes a card at its size in inches", () => {
    fs.writeFileSync(
      path.join(out, "poker.json"),
      JSON.stringify({ cards: { layout: "free", width: 250, height: 350 } }),
    );
    const result = maker(
      out,
      "18Test",
      "--format",
      "png",
      "--docs",
      "cards",
      "--config",
      "poker.json",
    );
    expect(result.status, result.stderr).toBe(0);

    // 2.5 by 3.5 inches at 300 dpi
    expect(png(path.join(out, "18Test/18test-card-train-1-2.png"))).toEqual({
      width: 750,
      height: 1050,
      pixelsPerMeter: 11811,
    });
  });

  // A card is 255.11 by 166.3 CSS pixels, painted 255 by 166: an image of a
  // pixel more has an edge the card only partly covers, partly transparent
  for (const [dpi, width, height] of [
    [96, 255, 166],
    [300, 796, 518],
  ]) {
    test(`writes cards with an opaque edge at ${dpi} dpi`, () => {
      const result = maker(
        out,
        "18Test",
        "--format",
        "png",
        "--docs",
        "cards",
        "--dpi",
        String(dpi),
      );
      expect(result.status, result.stderr).toBe(0);

      const dir = path.join(out, "18Test");
      const cards = fs
        .readdirSync(dir)
        .filter((name) => name.startsWith("18test-card-"));
      expect(cards).toHaveLength(48);
      for (const name of cards) {
        expect(png(path.join(dir, name)), name).toMatchObject({
          width,
          height,
        });
        expect(edgeAlpha(path.join(dir, name)), name).toEqual(OPAQUE);
      }
    });
  }

  // Cards do not take the background: a number card is one color to its edge
  test("writes a card with no white edge, even with --background white", () => {
    const result = maker(
      out,
      "18Test",
      "--format",
      "png",
      "--docs",
      "cards",
      "--background",
      "white",
    );
    expect(result.status, result.stderr).toBe(0);

    expect(
      edgeColors(path.join(out, "18Test/18test-card-number-1.png")),
    ).toEqual(["105,74,152,255"]);
  });

  // The alpha of the top left pixel of the map, a tile and a token
  const corners = async (page, ...flags) => {
    const result = maker(
      out,
      "18Test",
      "--format",
      "png",
      "--docs",
      "map,tiles,tokens",
      ...flags,
    );
    expect(result.status, result.stderr).toBe(0);

    const dir = path.join(out, "18Test");
    const token = fs
      .readdirSync(dir)
      .find((name) => name.startsWith("18test-token-"));
    return {
      map: await cornerAlpha(page, path.join(dir, "18test-map.png")),
      tile: await cornerAlpha(page, path.join(dir, "18test-tile-1.png")),
      token: await cornerAlpha(page, path.join(dir, token)),
    };
  };

  test("makes the map white by default, tiles and tokens transparent", async ({
    page,
  }) => {
    expect(await corners(page)).toEqual({ map: 255, tile: 0, token: 0 });
  });

  test("keeps tiles and tokens transparent with --background white", async ({
    page,
  }) => {
    expect(await corners(page, "--background", "white")).toEqual({
      map: 255,
      tile: 0,
      token: 0,
    });
  });

  test("makes the map transparent with --background transparent", async ({
    page,
  }) => {
    expect(await corners(page, "--background", "transparent")).toEqual({
      map: 0,
      tile: 0,
      token: 0,
    });
  });

  // Board18 boxes do not take the background: the map and the market are
  // always white, the tokens and tiles always transparent
  for (const background of ["transparent", "white"]) {
    test(`writes a Board 18 box the same with --background ${background}`, () => {
      const result = maker(
        out,
        "18Test",
        "--format",
        "b18",
        "--background",
        background,
      );
      expect(result.status, result.stderr).toBe(0);

      const files = unzip(path.join(out, "18Test/board18-18Test-1.0.zip"));
      const corner = (name) => {
        const { channels, pixels } = decodePng(
          files[`board18-18Test-1.0/18Test-1.0/${name}`],
        );
        return [...pixels.subarray(0, 3), channels === 4 ? pixels[3] : 255];
      };
      expect(corner("Map.png")).toEqual([255, 255, 255, 255]);
      expect(corner("Market.png")).toEqual([255, 255, 255, 255]);
      expect(corner("Tokens.png")[3]).toBe(0);
      expect(corner("Yellow.png")[3]).toBe(0);
    });
  }

  test("refuses another background", () => {
    const result = maker(out, "18Test", "--background", "black");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain(
      "--background must be transparent or white",
    );
  });

  test("exports a game file", () => {
    const result = maker(out, fixture, "--format", "png", "--docs", "map");
    expect(result.status, result.stderr).toBe(0);

    expect(fs.readdirSync(path.join(out, "e2e-game"))).toEqual([
      "e2e-fixture-game-map.png",
    ]);
  });

  test("has the exports of a game file, and a flag over them", () => {
    const file = path.join(out, "boxed.json");
    const game = JSON.parse(fs.readFileSync(fixture, "utf-8"));
    fs.writeFileSync(
      file,
      JSON.stringify({
        ...game,
        exports: { docs: ["map"], png: { dpi: 50 } },
      }),
    );

    let result = maker(out, file);
    expect(result.status, result.stderr).toBe(0);
    expect(fs.readdirSync(path.join(out, "boxed"))).toEqual([
      "e2e-fixture-game-map-paginated.pdf",
      "e2e-fixture-game-map.pdf",
    ]);

    fs.rmSync(path.join(out, "boxed"), { recursive: true });
    result = maker(out, file, "--docs", "background");
    expect(result.status, result.stderr).toBe(0);
    expect(fs.readdirSync(path.join(out, "boxed"))).toEqual([
      "e2e-fixture-game-background.pdf",
    ]);
  });

  test("rejects a resolution over 300 dpi", () => {
    const result = maker(out, "18Test", "--format", "png", "--dpi", "301");

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("--dpi 301 is too high");
    expect(fs.readdirSync(out)).toEqual([]);
  });
});
