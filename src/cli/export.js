import fs from "node:fs";
import path from "node:path";

import { chromium } from "playwright";

import {
  customConfig,
  defaultConfig,
  loadCompanyOverrides,
  loadSchema,
  loadTiles,
  startExpress,
} from "#cli/util";
import { docPath } from "#export/names";
import { runExport } from "#export/run";
import { resolveConfig } from "#util/resolveConfig";
import { compileTiles } from "#util/tiles";

export const BASE_URL = "http://localhost:9000";

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

// The config of a game: the defaults, src/config.json and the game's own
export const loadGameConfig = (game) =>
  resolveConfig({
    defaults: defaultConfig,
    user: customConfig,
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

// Captures a file from the site with a Playwright page: a pdf is printed, a
// b18 image is a screenshot of a viewport with the size of the image
export const capturePage = (page) => async (job) => {
  const { doc, format } = job;
  console.log(`Printing ${job.path}`);
  await page.goto(`${BASE_URL}${docPath(doc)}`, { waitUntil: "networkidle" });

  if (format === "pdf") {
    return page.pdf({ scale: 1.0, preferCSSPageSize: true });
  }

  const { viewport, transparent } = doc.capture;
  await page.emulateMedia({ media: "print" });
  await page.setViewportSize({ width: viewport.w, height: viewport.h });
  return page.screenshot({ omitBackground: transparent });
};

// Serves the built site and opens a browser while the callback runs, and
// always closes both
export const withBrowser = async (callback) => {
  const server = startExpress();
  let browser;
  try {
    browser = await chromium.launch({
      args: ["--force-color-profile srgb"],
    });
    return await callback(await browser.newPage());
  } finally {
    await browser?.close();
    server.close();
  }
};

// Runs the jobs of one game in a browser, writing into a folder. Returns the
// files that failed.
export const exportGame = async ({ page, jobs, out }) => {
  const { failed } = await runExport({
    jobs,
    capture: capturePage(page),
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
