import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { readPng } from "../src/export/png.js";

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
      "--paginated",
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
    expect(png(path.join(dir, "18test-map.png")).width).toBe(4350);

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

  test("makes the background of every image transparent", async ({ page }) => {
    const result = maker(
      out,
      "18Test",
      "--format",
      "png",
      "--docs",
      "map,tiles",
    );
    expect(result.status, result.stderr).toBe(0);

    const dir = path.join(out, "18Test");
    expect(await cornerAlpha(page, path.join(dir, "18test-tile-1.png"))).toBe(
      0,
    );
    expect(await cornerAlpha(page, path.join(dir, "18test-map.png"))).toBe(0);
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
        exports: { docs: ["map"], paginated: true, png: { dpi: 50 } },
      }),
    );

    let result = maker(out, file);
    expect(result.status, result.stderr).toBe(0);
    expect(fs.readdirSync(path.join(out, "boxed"))).toEqual([
      "e2e-fixture-game-map-paginated.pdf",
      "e2e-fixture-game-map.pdf",
    ]);

    fs.rmSync(path.join(out, "boxed"), { recursive: true });
    result = maker(out, file, "--no-paginated");
    expect(result.status, result.stderr).toBe(0);
    expect(fs.readdirSync(path.join(out, "boxed"))).toEqual([
      "e2e-fixture-game-map.pdf",
    ]);
  });

  test("rejects a resolution over 300 dpi", () => {
    const result = maker(out, "18Test", "--format", "png", "--dpi", "301");

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("--dpi 301 is too high");
    expect(fs.readdirSync(out)).toEqual([]);
  });
});
