import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { readPng } from "../src/export/png.js";
import { OPAQUE, edgeAlpha, edgeColors } from "./export-files.js";

// The --dpi tests of maker export, apart from cli.spec.js so that the two
// export shards of CI take about as long. Against the built site
// (dist/site), for 18Test, in a browser of its own.
const bin = path.resolve(import.meta.dirname, "../bin/maker.js");

const maker = (out, ...args) =>
  spawnSync(
    process.execPath,
    [bin, "export", ...args, "--jobs", "2", "--out", out],
    {
      cwd: out,
      encoding: "utf-8",
    },
  );

const png = (file) => readPng(new Uint8Array(fs.readFileSync(file)));

let out;

test.beforeEach(() => {
  out = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-e2e-cli-"));
});

test.afterEach(() => {
  fs.rmSync(out, { recursive: true, force: true });
});

test.describe("maker export 18Test", () => {
  test.setTimeout(120_000);

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

    expect(png(path.join(out, "18Test/png/18test-background.png"))).toEqual({
      width: 1200,
      height: 1575,
      pixelsPerMeter: 5906,
    });
  });

  // A card is 255.11 by 166.3 CSS pixels, painted 255 by 166: an image of a
  // pixel more has an edge the card only partly covers, partly transparent
  for (const [dpi, width, height] of [
    [96, 255, 166],
    [300, 796, 518],
  ]) {
    // Cards do not take the background: a number card is one color to its
    // edge, even with --background white (passed at 96 dpi only)
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
        ...(dpi === 96 ? ["--background", "white"] : []),
      );
      expect(result.status, result.stderr).toBe(0);

      const dir = path.join(out, "18Test/png");
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
      if (dpi === 96) {
        expect(edgeColors(path.join(dir, "18test-card-number-1.png"))).toEqual([
          "105,74,152,255",
        ]);
      }
    });
  }

  test("rejects a resolution over 300 dpi", () => {
    const result = maker(out, "18Test", "--format", "png", "--dpi", "301");

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("--dpi 301 is too high");
    expect(fs.readdirSync(out)).toEqual([]);
  });
});
