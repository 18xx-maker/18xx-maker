import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { _electron as electron, expect, test } from "@playwright/test";

import { readPng } from "../src/export/png.js";

// Exports 18Test from the built Electron app (dist/main, run pnpm build:app
// first) with its options panel, and checks the files like cli.spec.js does.
// This opens real windows, so it only runs with E2E_ELECTRON=1 (on Linux it
// needs a display, xvfb-run).
test.skip(!process.env.E2E_ELECTRON, "set E2E_ELECTRON=1 to run the app");

const main = path.resolve(import.meta.dirname, "../dist/main/index.cjs");

const png = (file) => readPng(new Uint8Array(fs.readFileSync(file)));
const pages = (file) =>
  [
    ...fs
      .readFileSync(file)
      .toString("latin1")
      .matchAll(/\/Type\s*\/Page\b(?!s)/g),
  ].length;

// Every app gets its own user data, so the route it restores and the recents it
// lists are never those of an earlier run (or of the app of whoever runs this)
const launch = () =>
  electron.launch({
    args: [
      main,
      `--user-data-dir=${path.join(out, "user-data")}`,
      ...(process.platform === "linux" && process.env.CI
        ? ["--no-sandbox"]
        : []),
    ],
  });

// The main window, on a page of the app. The window exists before its page is
// loaded: a hash set earlier is lost when the load of the app replaces it.
const show = async (app, hash) => {
  const window = await app.firstWindow();
  await window.waitForLoadState("load");
  await window.setViewportSize({ width: 1280, height: 900 });
  await window.evaluate((to) => {
    window.location.hash = to;
  }, hash);
  await expect(window).toHaveURL((url) => url.hash === hash);
  return window;
};

let out;
let app;

test.beforeEach(() => {
  out = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-e2e-app-"));
});

test.afterEach(async () => {
  await app?.close();
  fs.rmSync(out, { recursive: true, force: true });
});

test.describe("the app exports 18Test", () => {
  // One app at a time, they open real windows
  test.describe.configure({ mode: "serial" });

  test.setTimeout(180_000);

  test("writes pdf, png and a Board 18 box from the options panel", async () => {
    app = await launch();
    // The folder is chosen without a dialog, and nothing is shown in the
    // file manager
    await app.evaluate(({ dialog, shell }, folder) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [folder],
      });
      shell.showItemInFolder = () => {};
    }, out);

    const window = await show(app, "#/games/18Test/map");
    await window.getByRole("button", { name: "Export" }).click();
    await window.getByRole("menuitem", { name: "Export options" }).click();

    const panel = window.getByRole("dialog");
    await panel.getByRole("checkbox", { name: "PNG images" }).check();
    await panel.getByRole("checkbox", { name: "Board18 box" }).check();

    // Only the background and the map
    const documents = panel.getByRole("group", { name: "Documents" });
    for (const box of await documents.getByRole("checkbox").all()) {
      const label = await box.evaluate((el) => el.nextElementSibling.innerText);
      if (!["Background", "Map"].includes(label)) await box.uncheck();
    }

    await panel.getByRole("button", { name: "Choose folder" }).click();
    await expect(panel.getByText(out)).toBeVisible();
    await panel.getByRole("button", { name: "Export", exact: true }).click();

    await expect(window.getByText(/^Exported \d+ files to /)).toBeVisible({
      timeout: 150_000,
    });

    expect(pages(path.join(out, "18test-map.pdf"))).toBe(1);
    expect(pages(path.join(out, "18test-map-paginated.pdf"))).toBe(2);
    expect(png(path.join(out, "18test-background.png"))).toEqual({
      width: 2400,
      height: 3150,
      pixelsPerMeter: 11811,
    });
    expect(png(path.join(out, "18test-map.png")).width).toBe(4500);

    const box = path.join(out, "board18-18Test-1.0");
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

  test("quits in the middle of an export without leaving windows behind", async () => {
    app = await launch();
    await app.evaluate(({ dialog, shell }, folder) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [folder],
      });
      shell.showItemInFolder = () => {};
    }, out);

    const window = await show(app, "#/games/18Test/map");
    await window.getByRole("button", { name: "Export" }).click();
    await window
      .getByRole("menuitem", { name: "Export game as png images" })
      .click();
    await expect
      .poll(() => fs.readdirSync(out).length, { timeout: 60_000 })
      .toBeGreaterThan(0);

    const closed = new Promise((resolve) =>
      app.process().once("exit", resolve),
    );
    await app.evaluate(({ app: electron }) => electron.quit());
    await Promise.race([
      closed,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("The app did not quit")), 20_000),
      ),
    ]);
    const written = fs.readdirSync(out).length;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(fs.readdirSync(out)).toHaveLength(written);
    app = undefined;
  });
});
