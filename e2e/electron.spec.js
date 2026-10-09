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

// What the app showed in the file manager, recorded instead of opening it
const shown = (app) => app.evaluate(() => globalThis.shown ?? []);

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

  test("writes pdf, png, svg and a Board 18 box from the options panel", async () => {
    app = await launch();
    // The folder is chosen without a dialog, and what is shown in the file
    // manager is recorded
    await app.evaluate(({ dialog, shell }, folder) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [folder],
      });
      shell.showItemInFolder = (file) => {
        globalThis.shown = [...(globalThis.shown ?? []), file];
      };
    }, out);

    const window = await show(app, "#/games/18Test/map");
    await window.getByRole("button", { name: "Export" }).click();
    await window.getByRole("menuitem", { name: "Export options" }).click();

    const panel = window.getByRole("dialog");
    await panel.getByRole("checkbox", { name: "PNG images" }).check();
    await panel.getByRole("checkbox", { name: "SVG images" }).check();
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

    // Each format has its own folder in the folder of the game, like the CLI
    const dir = path.join(out, "18Test");
    expect(fs.readdirSync(dir).sort()).toEqual([
      "board18-18Test-1.0",
      "board18-18Test-1.0.zip",
      "pdf",
      "png",
      "svg",
    ]);
    expect(pages(path.join(dir, "pdf/18test-map.pdf"))).toBe(1);
    expect(pages(path.join(dir, "pdf/18test-map-paginated.pdf"))).toBe(2);
    expect(png(path.join(dir, "png/18test-background.png"))).toEqual({
      width: 2400,
      height: 3150,
      pixelsPerMeter: 11811,
    });
    expect(png(path.join(dir, "png/18test-map.png")).width).toBe(4275);
    const svg = fs.readFileSync(path.join(dir, "svg/18test-map.svg"), "utf-8");
    expect(svg.startsWith("<?xml")).toBe(true);
    expect(svg).toMatch(/<svg [^>]*width="1320"/);
    expect(fs.existsSync(path.join(dir, "svg/18test-background.svg"))).toBe(
      false,
    );

    const box = path.join(dir, "board18-18Test-1.0");
    expect(png(path.join(box, "18Test-1.0/Tokens.png"))).toEqual({
      width: 60,
      height: 1080,
      pixelsPerMeter: null,
    });
    expect(
      JSON.parse(fs.readFileSync(path.join(box, "18Test-1.0.json"), "utf-8")),
    ).toMatchObject({ bname: "18Test", version: "1.0" });
    expect(fs.existsSync(`${box}.zip`)).toBe(true);

    // The folder is not shown unless the setting is on
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(await shown(app)).toEqual([]);
  });

  test("shows the folder after an export when the setting is on", async () => {
    app = await launch();
    await app.evaluate(({ dialog, shell }, folder) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [folder],
      });
      shell.showItemInFolder = (file) => {
        globalThis.shown = [...(globalThis.shown ?? []), file];
      };
    }, out);

    const window = await show(app, "#/settings");
    await window
      .getByRole("switch", { name: "Open the folder after exporting" })
      .click();

    await window.evaluate(() => {
      window.location.hash = "#/games/18Test/map";
    });
    await window.getByRole("button", { name: "Export" }).click();
    await window.getByRole("menuitem", { name: "Export options" }).click();
    const panel = window.getByRole("dialog");
    await panel.getByRole("checkbox", { name: "PDF documents" }).uncheck();
    await panel.getByRole("checkbox", { name: "SVG images" }).check();
    const documents = panel.getByRole("group", { name: "Documents" });
    for (const box of await documents.getByRole("checkbox").all()) {
      const label = await box.evaluate((el) => el.nextElementSibling.innerText);
      if (label !== "Map") await box.uncheck();
    }
    await panel.getByRole("button", { name: "Choose folder" }).click();
    await expect(panel.getByText(out)).toBeVisible();
    await panel.getByRole("button", { name: "Export", exact: true }).click();
    await expect(window.getByText(/^Exported \d+ files to /)).toBeVisible({
      timeout: 150_000,
    });

    const dir = path.join(out, "18Test");
    await expect.poll(() => shown(app)).toHaveLength(1);
    const [file] = await shown(app);
    expect(file.startsWith(dir + path.sep)).toBe(true);
    expect(fs.existsSync(file)).toBe(true);
  });

  test("opens the export menu from another page", async () => {
    app = await launch();

    const window = await show(app, "#/games/18Test/map");
    await expect(window.getByRole("button", { name: "Export" })).toBeVisible();
    await window.evaluate(() => {
      window.location.hash = "#/settings";
    });
    await expect(window).toHaveURL((url) => url.hash === "#/settings");

    await window.keyboard.press("x");
    await expect(
      window.getByRole("menuitem", { name: "Export options" }),
    ).toBeVisible();
    await window.keyboard.press("Escape");
    await window.getByRole("button", { name: /^Export/ }).click();
    await expect(
      window.getByRole("menuitem", { name: "Export options" }),
    ).toBeVisible();
  });

  test("saves a copy of a bundled game where the save dialog says", async () => {
    app = await launch();
    const file = path.join(out, "my-copy.json");
    await app.evaluate(({ dialog }, filePath) => {
      dialog.showSaveDialog = async (...args) => {
        globalThis.dialogOptions = args.at(-1);
        return { canceled: false, filePath };
      };
    }, file);

    const window = await show(app, "#/games/18Test");
    await window.getByRole("button", { name: "Save as..." }).click();

    await expect(window).toHaveURL((url) =>
      url.hash.startsWith("#/games/electron:"),
    );
    const game = JSON.parse(fs.readFileSync(file, "utf-8"));
    expect(game.info.title).toBe("18Test");
    expect(game.meta).toBeUndefined();
    const options = await app.evaluate(() => globalThis.dialogOptions);
    expect(options.defaultPath).toBe("18test.json");
    expect(options.title).toBe("Save as");

    // The copy is a game of the app and one of the recents. An unpackaged app
    // keeps its config next to the build, not in its user data, so the game is
    // forgotten again.
    const slug = new URL(window.url()).hash.slice("#/games/".length);
    const config = () =>
      window.evaluate(() => window.api.loadConfig().then((r) => r.config));
    await expect
      .poll(async () => (await config()).recents.map((recent) => recent.slug))
      .toContain(slug);
    const summary = Object.values((await config()).summaries).find(
      (summary) => summary.slug === slug,
    );
    expect(summary.path).toBe(file);
    await window.evaluate((id) => window.api.deleteGame(id), summary.id);
  });

  test("keeps the custom images of a copy, adds to and exports them from its folder", async () => {
    app = await launch();
    const file = path.join(out, "copy.json");
    const exportTo = path.join(out, "exported");
    fs.mkdirSync(exportTo);
    await app.evaluate(
      ({ dialog }, { filePath, folder }) => {
        dialog.showSaveDialog = async () => ({ canceled: false, filePath });
        dialog.showOpenDialog = async () => ({
          canceled: false,
          filePaths: [folder],
        });
      },
      { filePath: file, folder: exportTo },
    );

    const window = await show(app, "#/games/18Test");
    await window.getByRole("button", { name: "Save as..." }).click();
    await expect(window).toHaveURL((url) =>
      url.hash.startsWith("#/games/electron:"),
    );

    // Save as writes the images of the bundled game next to the copy
    const assets = path.join(out, "copy.assets");
    const listing = (...parts) => fs.readdirSync(path.join(assets, ...parts));
    expect(listing("icons")).toEqual(["star.svg"]);
    expect(listing("logos")).toEqual(["crest.svg"]);
    expect(listing("trains")).toEqual(["loco.png"]);

    const slug = new URL(window.url()).hash.slice("#/games/".length);
    const config = () =>
      window.evaluate(() => window.api.loadConfig().then((r) => r.config));
    const summary = Object.values((await config()).summaries).find(
      (summary) => summary.slug === slug,
    );

    // The preload reads the folder, and adds an image to it
    const folder = await window.evaluate(
      (id) => window.api.loadAssets(id),
      summary.id,
    );
    expect(Object.keys(folder.icons)).toEqual(["star"]);
    const add = (name, text, options) =>
      window.evaluate(
        async ([id, name, text, options]) => {
          const bytes = new TextEncoder().encode(text);
          try {
            return await window.api.addAsset(
              id,
              "icons",
              name,
              bytes.buffer,
              options,
            );
          } catch (e) {
            return { error: /^asset:(\w+)/.exec(e.message)?.[1] };
          }
        },
        [summary.id, name, text, options],
      );
    const moon = '<svg viewBox="0 0 10 10"><circle r="4"/></svg>';
    expect(await add("moon", moon)).toMatchObject({
      kind: "icons",
      name: "moon",
      value: moon,
      replaced: false,
    });
    expect(fs.readFileSync(path.join(assets, "icons/moon.svg"), "utf-8")).toBe(
      moon,
    );
    expect(await add("moon", moon)).toEqual({ error: "exists" });
    expect(await add("Moon", moon, { replace: true })).toMatchObject({
      name: "moon",
      replaced: true,
    });
    expect(await add("../moon", moon)).toEqual({ error: "name" });
    expect(await add("evil", "<svg><script/></svg>")).toEqual({
      error: "content",
    });

    // An export uses the folder, whatever the page says: the crest is changed
    // on disk, the page still has the one of the bundled game
    const crest = fs.readFileSync(
      path.join(assets, "logos/crest.svg"),
      "utf-8",
    );
    fs.writeFileSync(
      path.join(assets, "logos/crest.svg"),
      crest.replace("M20 15h60v35", "M20 16h60v35"),
    );
    await window.getByRole("button", { name: "Export" }).click();
    await window.getByRole("menuitem", { name: "Export options" }).click();
    const panel = window.getByRole("dialog");
    await panel.getByRole("checkbox", { name: "PDF documents" }).uncheck();
    await panel.getByRole("checkbox", { name: "SVG images" }).check();
    const documents = panel.getByRole("group", { name: "Documents" });
    for (const box of await documents.getByRole("checkbox").all()) {
      const label = await box.evaluate((el) => el.nextElementSibling.innerText);
      if (label !== "Tokens") await box.uncheck();
    }
    await panel.getByRole("button", { name: "Choose folder" }).click();
    await panel.getByRole("button", { name: "Export", exact: true }).click();
    await expect(window.getByText(/^Exported \d+ files to /)).toBeVisible({
      timeout: 150_000,
    });

    const [gameDir] = fs.readdirSync(exportTo);
    const token = fs.readFileSync(
      path.join(exportTo, gameDir, "svg/18test-token-2-LBRR.svg"),
      "utf-8",
    );
    expect(token).toContain("M20 16h60v35c0 22-30 35-30 35S20 72 20 50z");
    expect(token).not.toContain("M20 15h60v35");

    await window.evaluate((id) => window.api.deleteGame(id), summary.id);
  });

  test("runs the keyboard shortcuts from the menu", async () => {
    app = await launch();
    const click = (id) =>
      app.evaluate(
        ({ Menu }, itemId) =>
          Menu.getApplicationMenu().getMenuItemById(itemId).click(),
        id,
      );
    const window = await show(app, "#/games/18Test/map");
    await expect(window.getByRole("button", { name: "Export" })).toBeVisible();

    // A key of the app
    await click("json");
    await expect(
      window.getByRole("textbox", { name: "Game JSON" }),
    ).toBeVisible();

    // A key of the app in a dialog
    await click("shortcuts");
    await expect(window.getByRole("dialog")).toBeVisible();
    await click("current-game");
    await expect(window).toHaveURL((url) => url.hash === "#/games/18Test");
    await expect(window.getByRole("dialog")).toHaveCount(0);

    // A page
    await click("load");
    await expect(window).toHaveURL((url) => url.hash === "#/games/");

    // The sidebar
    const sidebar = window.locator("[data-collapsible]");
    await expect(sidebar).toHaveAttribute("data-state", "expanded");
    await click("sidebar");
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
  });

  test("saves the game from the File menu and from the key, once each", async () => {
    app = await launch();
    const file = path.join(out, "save-copy.json");
    await app.evaluate(({ dialog }, filePath) => {
      dialog.showSaveDialog = async () => ({ canceled: false, filePath });
      // The writes to the file, however the save was asked for
      const fs = process.mainModule.require("node:fs");
      const write = fs.writeFileSync;
      globalThis.writes = [];
      fs.writeFileSync = (target, ...rest) => {
        if (target === filePath) globalThis.writes.push(target);
        return write(target, ...rest);
      };
    }, file);

    const window = await show(app, "#/games/18Test");
    await window.getByRole("button", { name: "Save as..." }).click();
    await expect(window).toHaveURL((url) =>
      url.hash.startsWith("#/games/electron:"),
    );
    const writes = () => app.evaluate(() => globalThis.writes.length);
    expect(await writes()).toBe(1);
    const slug = new URL(window.url()).hash.slice("#/games/".length);

    const edit = async (text) => {
      const editor = window.getByRole("textbox", { name: "Game JSON" });
      await editor.click();
      await window.keyboard.press("ControlOrMeta+Home");
      await window.keyboard.press("ArrowRight");
      await window.keyboard.type(text);
      await expect(window.getByTestId("toolbar-save")).toBeVisible();
    };

    await window.evaluate((to) => {
      window.location.hash = to;
    }, `#/games/${slug}/map`);
    await expect(window.getByRole("button", { name: "Export" })).toBeVisible();
    await window.keyboard.press("j");

    // The File menu item
    await edit('"menuEdit": 1,');
    await app.evaluate(({ Menu }) =>
      Menu.getApplicationMenu().getMenuItemById("save").click(),
    );
    await expect(window.getByTestId("toolbar-save")).toHaveCount(0);
    expect(await writes()).toBe(2);
    expect(fs.readFileSync(file, "utf-8")).toContain("menuEdit");

    // The key
    await edit('"keyEdit": 2,');
    await window.keyboard.press("ControlOrMeta+s");
    await expect(window.getByTestId("toolbar-save")).toHaveCount(0);
    expect(await writes()).toBe(3);
    expect(fs.readFileSync(file, "utf-8")).toContain("keyEdit");

    const config = () =>
      window.evaluate(() => window.api.loadConfig().then((r) => r.config));
    const summary = Object.values((await config()).summaries).find(
      (summary) => summary.slug === slug,
    );
    await window.evaluate((id) => window.api.deleteGame(id), summary.id);
  });

  test("opens the JSON editor with the j key", async () => {
    app = await launch();

    const window = await show(app, "#/games/18Test/map");
    await expect(window.getByRole("button", { name: "Export" })).toBeVisible();
    await window.keyboard.press("j");
    await expect(
      window.getByRole("textbox", { name: "Game JSON" }),
    ).toBeVisible();
    await expect(window.getByRole("status")).toContainText("Valid JSON");
  });

  test("quits in the middle of an export without leaving windows behind", async () => {
    app = await launch();
    await app.evaluate(({ dialog, shell }, folder) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [folder],
      });
      shell.showItemInFolder = (file) => {
        globalThis.shown = [...(globalThis.shown ?? []), file];
      };
    }, out);

    const window = await show(app, "#/games/18Test/map");
    await window.getByRole("button", { name: "Export" }).click();
    await window
      .getByRole("menuitem", { name: "Export game as png images" })
      .click();
    await expect
      .poll(() => fs.readdirSync(out, { recursive: true }).length, {
        timeout: 60_000,
      })
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
    const written = fs.readdirSync(out, { recursive: true }).length;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(fs.readdirSync(out, { recursive: true })).toHaveLength(written);
    app = undefined;
  });
});
