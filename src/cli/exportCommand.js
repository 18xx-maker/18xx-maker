import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { mergeDeepRight } from "ramda";

import {
  createCapture,
  createFileSink,
  exportGame,
  loadExportData,
  loadGameConfig,
  reportFailures,
  withBrowser,
} from "#cli/export";
import {
  UsageError,
  customConfig,
  loadGame,
  setup,
  startExpress,
} from "#cli/util";
import { b18Spec } from "#export/b18";
import { MAX_DPI } from "#export/capture";
import { documents } from "#export/documents";
import { exportJobs } from "#export/names";
import { renderGame, renderSlug } from "#export/render";
import { DOCS, selectDocs } from "#export/select";
import { writeZip } from "#export/zip";

export { DOCS, selectDocs };

export const FORMATS = ["pdf", "png", "b18"];

const list = (value, valid, what) => {
  const items = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const unknown = items.filter((item) => !valid.includes(item));
  if (unknown.length > 0 || items.length === 0) {
    throw new UsageError(
      `Unknown ${what} ${unknown.join(", ")}, use ${valid.join(", ")}`,
    );
  }
  return items;
};

// The resolution of --dpi: 1 to 300
export const parseDpi = (value = MAX_DPI) => {
  const dpi = Number(value);
  if (!Number.isInteger(dpi) || dpi < 1) {
    throw new UsageError(`--dpi must be a whole number from 1 to ${MAX_DPI}`);
  }
  if (dpi > MAX_DPI) {
    throw new UsageError(
      `--dpi ${dpi} is too high, the highest resolution is ${MAX_DPI}`,
    );
  }
  return dpi;
};

const parseCount = (value, name, fallback) => {
  const count = Number(value ?? fallback);
  if (!Number.isInteger(count) || count < 1) {
    throw new UsageError(`${name} must be a whole number of 1 or more`);
  }
  return count;
};

// A game to export from what the user typed: the id of a bundled game or the
// path of a game file. A file is validated against the game schema and its id
// is its name. Returns { id, game }.
export const resolveGame = async (name) => {
  if (!/\.json$/i.test(name) && !/[\\/]/.test(name)) {
    return { id: name, game: loadGame(name) };
  }

  if (!existsSync(name)) throw new UsageError(`${name} not found`);
  const { validateGameFile } = await import("#cli/validate");
  const result = validateGameFile(name);
  if (!result.valid) {
    const errors = result.error
      ? [result.error]
      : result.validationErrors
          .slice(0, 5)
          .map((error) => `${error.data.pointer} ${error.message}`);
    throw new UsageError(`${name} is not a valid game:\n${errors.join("\n")}`);
  }

  return {
    id: path.basename(name, path.extname(name)),
    game: JSON.parse(readFileSync(name, "utf-8")),
  };
};

// The config of a file given with --config. Like config.json it only has the
// settings to change.
export const loadConfigFile = (file) => {
  if (!existsSync(file)) throw new UsageError(`${file} not found`);
  let config;
  try {
    config = JSON.parse(readFileSync(file, "utf-8"));
  } catch (error) {
    throw new UsageError(`${file} is not valid JSON: ${error.message}`);
  }
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new UsageError(`${file} is not a config, it must be a JSON object`);
  }
  return config;
};

// maker export: pdf, png and Board 18 files of a game
//   format      "pdf,png,b18"
//   docs        "map,cards": only these pages
//   layouts     "all": a sheet for every layout
//   paginated   also the paginated pdfs
//   variation   only this map variation
//   config      a config file
//   dpi         of the pngs, 1 to 300
//   out         the folder the folder of the game goes in
//   jobs        how many files are captured at the same time
//   all         every bundled game
//   b18Version, b18Author
//   debug       serve the site and wait
const command = async (game, opts = {}) => {
  const formats = list(opts.format || "pdf", FORMATS, "format");
  const docs = opts.docs && list(opts.docs, DOCS, "page");
  if (
    opts.layouts !== undefined &&
    !["all", "current"].includes(opts.layouts)
  ) {
    throw new UsageError(`--layouts must be all or current`);
  }
  const dpi = parseDpi(opts.dpi);
  const jobs = parseCount(opts.jobs, "--jobs", 1);
  const variation =
    opts.variation === undefined ? undefined : Number(opts.variation);
  if (
    variation !== undefined &&
    !(Number.isInteger(variation) && variation >= 0)
  ) {
    throw new UsageError("--variation must be a whole number");
  }

  if (opts.debug) {
    setup();
    startExpress();
    console.log("Debug Mode");
    console.log("Starting the express server on http://localhost:9000");
    console.log("\nCtrl-C when done");
    return;
  }

  if (opts.all && game) {
    throw new UsageError("Use a game or --all, not both");
  }
  if (!opts.all && !game) {
    throw new UsageError("Name a game or a game file, or use --all");
  }

  setup();

  let names = [game];
  if (opts.all) {
    names = readdirSync("./src/data/games")
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.replace(/\.json$/, ""));
  }
  console.log(`Games: ${names.join(", ")}`);

  const user = opts.config ? loadConfigFile(opts.config) : {};
  const data = loadExportData();
  const failed = [];
  const root = opts.out || "render";

  // The games are resolved first, a mistake in one is a mistake before any
  // file is written
  const resolved = [];
  for (const name of names) {
    const found = await resolveGame(name);
    if (
      variation !== undefined &&
      Array.isArray(found.game.map) &&
      variation >= found.game.map.length
    ) {
      throw new UsageError(`${found.id} has no map variation ${variation}`);
    }
    resolved.push(found);
  }

  await withBrowser(async ({ browser, baseUrl }) => {
    for (const { id, game: gameDef } of resolved) {
      let config = loadGameConfig(gameDef, user);
      if (opts.layouts === "all") {
        config = mergeDeepRight(config, { export: { allLayouts: true } });
      }
      const exportData = { ...data, slug: renderSlug(id) };
      const out = path.join(root, id);
      const run = (list) =>
        exportGame({
          capture: createCapture({
            browser,
            baseUrl,
            dpi,
            // The page is given the game and the config of the layers below
            // the game's own, like the sizes are planned with
            input: {
              id,
              game: renderGame(gameDef, id),
              config: mergeDeepRight(customConfig, user),
            },
          }),
          jobs: list,
          out,
          concurrency: jobs,
        });

      const files = formats.filter((format) => format !== "b18");
      if (files.length > 0) {
        failed.push(
          ...(await run(
            exportJobs(
              gameDef,
              selectDocs(documents(gameDef, config, exportData), {
                docs,
                paginated: opts.paginated,
                variation,
              }),
              files,
            ),
          )),
        );
      }

      if (formats.includes("b18")) {
        const spec = b18Spec(gameDef, config, exportData, {
          id,
          slug: renderSlug(id),
          version: opts.b18Version || "1.0",
          author: opts.b18Author,
          variation,
        });

        console.log(`Writing  ${id}/${spec.names.json}`);
        createFileSink(out).write(
          spec.names.json,
          JSON.stringify(spec.json, null, 2),
        );
        failed.push(...(await run(exportJobs(gameDef, spec.images, ["b18"]))));

        console.log(`Creating ${id}/${spec.names.zip}`);
        await writeZip(out, spec.names);
      }
    }
  });

  reportFailures(failed);
};

export default command;
