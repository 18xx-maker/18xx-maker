import fs from "node:fs";
import path from "node:path";

import { chromium } from "playwright";

import { mergeDeepRight } from "ramda";

import {
  customConfig,
  defaultConfig,
  loadCompanyOverrides,
  loadSchema,
  loadTiles,
  startExpress,
} from "#cli/util";
import { capture, withTimeout } from "#export/capture";
import { docPath } from "#export/names";
import { runExport } from "#export/run";
import { resolveConfig } from "#util/resolveConfig";
import { compileTiles } from "#util/tiles";

// Everything the export list needs that the app gets from the bundler
export const loadExportData = () => {
  const schema = loadSchema("config.schema.json");
  const layouts = (name) => schema.properties[name].properties.layout.enum;

  return {
    tiles: compileTiles(...loadTiles()),
    companyOverrides: loadCompanyOverrides(),
    layouts: {
      cards: layouts("cards"),
      tiles: layouts("tiles"),
      tokens: layouts("tokens"),
    },
  };
};

// The config of a game: the defaults, src/config.json, the config of the user
// (--config) and the game's own
export const loadGameConfig = (game, user = {}) =>
  resolveConfig({
    defaults: defaultConfig,
    user: mergeDeepRight(customConfig, user),
    gameConfig: game.config,
  }).config;

// A sink that writes files in a folder. A path that leaves the folder is an
// error.
export const createFileSink = (root) => ({
  write: (relPath, bytes) => {
    const file = path.resolve(root, relPath);
    const relative = path.relative(root, file);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`${relPath} is outside of ${root}`);
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  },
});

// A document that takes longer than this to capture fails, in milliseconds
export const TIMEOUT = 120_000;

// Serves the built site and opens a browser while the callback runs, and
// always closes both. The site is on a free port. The browser has the color
// profile of sRGB, so screenshots look the same on every computer.
export const withBrowser = async (callback) => {
  const server = startExpress(0);
  let browser;
  try {
    browser = await chromium.launch({
      args: ["--force-color-profile=srgb"],
    });
    return await callback({
      browser,
      baseUrl: `http://localhost:${server.address().port}`,
    });
  } finally {
    await browser?.close();
    server.close();
  }
};

// A page of a browser that has the game and config of render mode, and the
// Playwright adapter of the shared capture: the commands of the Chrome
// DevTools Protocol go through the page's own session
const openPage = async (browser, input) => {
  const page = await browser.newPage();
  await page.addInitScript((given) => {
    window.__RENDER_INPUT__ = given;
  }, input);
  const session = await page.context().newCDPSession(page);
  return {
    page,
    send: (method, params) => session.send(method, params),
    evaluate: (expression) => page.evaluate(expression),
  };
};

// Captures the jobs of a game with pages of a browser, one for each job that
// runs at the same time. input is { id, game, config } for the page (render
// mode). A page that fails or takes too long is closed, the next job gets a
// new one, so a document can not break the ones after it.
export const createCapture = ({
  browser,
  baseUrl,
  input,
  dpi,
  maxPixels,
  timeout = TIMEOUT,
}) => {
  const idle = [];

  const run = async (slot, job) => {
    const { page } = slot;
    await page.goto(`${baseUrl}${docPath(job.doc)}`, {
      waitUntil: "networkidle",
    });
    await page.waitForFunction(() => document.body.dataset.renderState);
    if (
      (await page.evaluate(() => document.body.dataset.renderState)) !== "ready"
    ) {
      throw new Error(`${docPath(job.doc)} has nothing to show for this game`);
    }
    return capture(slot, job, { dpi, maxPixels });
  };

  return async (job) => {
    console.log(`Exporting ${job.path}`);
    const slot = idle.pop() || (await openPage(browser, input));
    try {
      const bytes = await withTimeout(
        run(slot, job),
        timeout,
        `Timed out after ${timeout / 1000} seconds`,
      );
      idle.push(slot);
      return bytes;
    } catch (error) {
      await slot.page.close().catch(() => {});
      throw error;
    }
  };
};

// Runs the jobs of one game in a browser, writing into a folder. Returns the
// files that failed.
export const exportGame = async ({ capture, jobs, out, concurrency }) => {
  const { failed } = await runExport({
    jobs,
    capture,
    concurrency,
    sink: createFileSink(out),
    onProgress: ({ type, name, error }) => {
      if (type === "fail") console.error(`Failed ${name}: ${error.message}`);
    },
  });
  return failed.map(({ job }) => job.path);
};

// Prints the files that failed, and makes the command exit with 1
export const reportFailures = (failed) => {
  if (failed.length > 0) {
    console.error(`\n${failed.length} documents failed:\n${failed.join("\n")}`);
    process.exitCode = 1;
  }
};
