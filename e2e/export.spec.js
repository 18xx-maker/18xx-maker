import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { _electron as electron, expect, test } from "@playwright/test";

import { readPng } from "../src/export/png.js";
import {
  OPAQUE,
  edgeAlpha,
  edges,
  expected,
  pages,
  png,
  unzip,
} from "./export-files.js";

// The six real export paths, {CLI, app} x {pdf, png, b18}, each exporting the
// same small fixed set of 18Test (see export-files.js) and checking the real
// files on disk. No mocks: the CLI is bin/maker.js on dist/site, the app is
// dist/main (pnpm build && pnpm build:app first). They run on Linux, macOS and
// Windows in the "Export" job of CI, and must assert the same on every OS.
const root = path.resolve(import.meta.dirname, "..");
const bin = path.join(root, "bin/maker.js");
const main = path.join(root, "dist/main/index.cjs");

test.describe.configure({ mode: "serial" });
test.setTimeout(180_000);

let out;
let app;

test.beforeEach(() => {
  // The real path: the temp dir of macOS is a symlink and the one of Windows
  // can be a short 8.3 name, and the app shows the folder it was given
  out = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "18xx-e2e-export-")),
  );
});

test.afterEach(async () => {
  await app?.close().catch(() => {});
  app = undefined;
  fs.rmSync(out, { recursive: true, force: true });
});

// The edges of the cards of the CLI, by name, to compare the app's with
let cliCards;
// The sizes of the images of the CLI, by name
let cliSizes;

// The most a channel of two lists of pixels differs by
const farthest = (one, two) =>
  Math.max(
    ...one.flatMap((pixel, i) =>
      pixel.map((value, k) => Math.abs(value - two[i][k])),
    ),
  );

// Every path leaves the same files in a folder, so the checks are shared
const check = {
  pdf: (dir) => {
    expect(pages(path.join(dir, expected.pdf.file))).toBe(expected.pdf.pages);
  },
  png: (dir, from) => {
    expect(png(path.join(dir, expected.png.file))).toEqual(expected.png.size);
    // The background is painted whole: centered in the window, it moves when
    // the device size is cut to it
    expect(edgeAlpha(path.join(dir, expected.png.file))).toEqual(OPAQUE);
    for (const [name, size] of Object.entries(expected.png.images)) {
      expect(png(path.join(dir, name)), name).toMatchObject(size);
    }
    // The map is on white by default, in the app too
    expect(edgeAlpha(path.join(dir, "18test-map.png"))).toEqual(OPAQUE);

    // The app's images are the size of the CLI's
    const sizes = Object.fromEntries(
      fs
        .readdirSync(dir)
        .filter((name) => name.endsWith(".png"))
        .map((name) => [name, png(path.join(dir, name))]),
    );
    if (from === "cli") cliSizes = sizes;
    if (from === "app" && cliSizes) expect(sizes).toEqual(cliSizes);

    // Every card has the same size, and an opaque edge: no pixel the card
    // only partly covers, dark on a dark background
    const { count, width, height } = expected.png.cards;
    const cards = fs
      .readdirSync(dir)
      .filter((name) => name.startsWith("18test-card-"));
    expect(cards).toHaveLength(count);
    for (const name of cards) {
      expect(png(path.join(dir, name)), name).toMatchObject({ width, height });
      expect(edgeAlpha(path.join(dir, name)), name).toEqual(OPAQUE);
    }

    // The app paints the cards like the CLI, whatever the screen: on a retina
    // screen a window paints them on its grid of half pixels. Only the
    // antialiasing of the two browsers may differ.
    const found = Object.fromEntries(
      cards.map((name) => [name, edges(path.join(dir, name))]),
    );
    if (from === "cli") cliCards = found;
    if (from === "app" && cliCards) {
      for (const name of cards) {
        for (const side of ["top", "bottom", "left", "right"]) {
          expect(
            farthest(found[name][side], cliCards[name][side]),
            `${name} ${side}`,
          ).toBeLessThanOrEqual(2);
        }
      }
    }
  },
  b18: (dir) => {
    const { zip, folder, images } = expected.b18;
    const files = unzip(path.join(dir, zip));
    const names = Object.keys(files);

    // Board 18 reads the box with its folder at the top, and zip names have
    // forward slashes whatever the OS
    expect(names.some((name) => name.includes("\\"))).toBe(false);
    expect(names).toEqual(
      expect.arrayContaining([
        `${folder}/18Test-1.0.json`,
        ...Object.keys(images).map((name) => `${folder}/18Test-1.0/${name}`),
      ]),
    );
    expect(names.every((name) => name.startsWith(`${folder}/`))).toBe(true);
    expect(
      JSON.parse(files[`${folder}/18Test-1.0.json`].toString("utf-8")),
    ).toMatchObject({ bname: "18Test", version: "1.0" });

    // Images are one pixel for each unit, without a resolution
    for (const [name, [width, height]] of Object.entries(images)) {
      const bytes = files[`${folder}/18Test-1.0/${name}`];
      expect(readPng(new Uint8Array(bytes)), name).toEqual({
        width,
        height,
        pixelsPerMeter: null,
      });
    }

    // The folder next to the zip has the same images
    expect(fs.existsSync(path.join(dir, folder, "18Test-1.0.json"))).toBe(true);
  },
};

// The documents each format is exported with, the fewest that show it works
const docs = {
  pdf: ["map"],
  png: ["background", "map", "market", "cards"],
  b18: ["map"],
};

for (const format of ["pdf", "png", "b18"]) {
  test(`export › cli › ${format}`, () => {
    const result = spawnSync(
      process.execPath,
      [
        bin,
        "export",
        "18Test",
        "--format",
        format,
        "--docs",
        docs[format].join(","),
        "--out",
        out,
      ],
      { cwd: out, encoding: "utf-8" },
    );
    expect(result.status, result.stderr).toBe(0);
    check[format](path.join(out, "18Test"), "cli");
  });
}

const launch = () =>
  electron.launch({
    args: [
      main,
      `--user-data-dir=${path.join(out, "user-data")}`,
      // Scrollbars that take room, like Linux and Windows, also on a Mac set
      // to show them when scrolling (only for this app, from its arguments)
      ...(process.platform === "darwin"
        ? ["-AppleShowScrollBars", "Always"]
        : []),
      // The CI Linux runner has no setuid chrome-sandbox for Electron. Only
      // there, and only when CI says so, never in a real run
      ...(process.platform === "linux" && process.env.CI
        ? ["--no-sandbox"]
        : []),
    ],
  });

const label = { pdf: "PDF documents", png: "PNG images", b18: "Board18 box" };

for (const format of ["pdf", "png", "b18"]) {
  test(`export › app › ${format}`, async () => {
    const dir = path.join(out, "files");
    fs.mkdirSync(dir);
    app = await launch();
    // The folder is chosen without a native dialog, nothing is shown in the
    // file manager
    await app.evaluate(({ dialog, shell }, folder) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [folder],
      });
      shell.showItemInFolder = () => {};
    }, dir);

    const window = await app.firstWindow();
    await window.setViewportSize({ width: 1280, height: 900 });
    await window.evaluate(() => {
      window.location.hash = "#/games/18Test/map";
    });
    await window.getByRole("button", { name: "Export" }).click();
    await window.getByRole("menuitem", { name: "Export options" }).click();

    const panel = window.getByRole("dialog");
    for (const [name, text] of Object.entries(label)) {
      await panel
        .getByRole("checkbox", { name: text })
        .setChecked(name === format);
    }

    const documents = panel.getByRole("group", { name: "Documents" });
    for (const box of await documents.getByRole("checkbox").all()) {
      const text = await box.evaluate((el) => el.nextElementSibling.innerText);
      // Board18 boxes have their own images, the documents are off
      if (await box.isEnabled()) {
        await box.setChecked(docs[format].includes(text.toLowerCase()));
      }
    }

    await panel.getByRole("button", { name: "Choose folder" }).click();
    await expect(panel.getByText(dir)).toBeVisible();
    await panel.getByRole("button", { name: "Export", exact: true }).click();
    await expect(window.getByText(/^Exported \d+ files to /)).toBeVisible({
      timeout: 150_000,
    });

    check[format](dir, "app");
  });
}
