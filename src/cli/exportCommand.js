import { existsSync, readdirSync } from "node:fs";
import { userInfo } from "node:os";
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
  loadJSON,
  setup,
  startServer,
} from "#cli/util";
import { b18Spec } from "#export/b18";
import { MAX_DPI } from "#export/capture";
import { documents } from "#export/documents";
import { exportJobs, formatFolder } from "#export/names";
import {
  BACKGROUNDS,
  MAX_CARD_BLEED,
  layoutsOfConfig,
  resolveExportOptions,
} from "#export/options";
import { renderGame, renderSlug } from "#export/render";
import { DOCS, selectDocs } from "#export/select";
import { gameFolder } from "#export/sink";
import { writeZip } from "#export/zip";

export { DOCS, selectDocs };

export const FORMATS = ["pdf", "png", "svg", "b18"];

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

// The bleed of --card-bleed: 0 to MAX_CARD_BLEED units
export const parseCardBleed = (value) => {
  const bleed = Number(value);
  if (
    String(value).trim() === "" ||
    !Number.isFinite(bleed) ||
    bleed < 0 ||
    bleed > MAX_CARD_BLEED
  ) {
    throw new UsageError(
      `--card-bleed must be a number from 0 to ${MAX_CARD_BLEED}`,
    );
  }
  return bleed;
};

// The resolution of --dpi: 1 to 300
export const parseDpi = (value) => {
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
    game: loadJSON(name),
  };
};

// The config of a file given with --config. Like config.json it only has the
// settings to change.
export const loadConfigFile = (file) => {
  if (!existsSync(file)) throw new UsageError(`${file} not found`);
  let config;
  try {
    config = loadJSON(file);
  } catch (error) {
    throw new UsageError(`${file} is not valid JSON: ${error.message}`);
  }
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new UsageError(`${file} is not a config, it must be a JSON object`);
  }
  return config;
};

// What the flags of maker export set, as the options of the `exports` field
// of a game (see resolveExportOptions). A flag that was not given is not set,
// so it does not hide the `exports` of the game.
const flagOptions = (opts) => {
  const user = {};
  if (opts.format !== undefined)
    user.formats = list(opts.format, FORMATS, "format");
  if (opts.docs !== undefined) user.docs = list(opts.docs, DOCS, "page");
  if (opts.layouts !== undefined) {
    if (!["all", "current"].includes(opts.layouts)) {
      throw new UsageError(`--layouts must be all or current`);
    }
    user.layouts = opts.layouts;
  }
  if (opts.background !== undefined) {
    if (!BACKGROUNDS.includes(opts.background)) {
      throw new UsageError("--background must be transparent or white");
    }
    user.background = opts.background;
  }
  if (opts.variation === "all") {
    user.variation = null;
  } else if (opts.variation !== undefined) {
    const variation = Number(opts.variation);
    if (!(Number.isInteger(variation) && variation >= 0)) {
      throw new UsageError("--variation must be a whole number or all");
    }
    user.variation = variation;
  }
  if (opts.dpi !== undefined) user.png = { dpi: parseDpi(opts.dpi) };
  if (opts.cardBleed !== undefined) {
    user.cards = { bleed: parseCardBleed(opts.cardBleed) };
  }
  if (opts.b18Version || opts.b18Author) {
    user.b18 = { version: opts.b18Version, author: opts.b18Author };
  }
  return user;
};

// maker export: pdf, png, svg and Board 18 files of a game. Every option can also
// be set in the game file (its `exports` field), what is given here wins.
//   format      "pdf,png,svg,b18", pdf
//   docs        "map,cards": only these pages
//   layouts     "all": a sheet for every layout
//   variation   only this map variation, or all
//   config      a config file
//   dpi         of the pngs, 1 to 300 (an svg has none)
//   cardBleed   the bleed of the single card pngs, in units
//   out         the folder the folder of the game goes in, with a folder
//               for each of pdf, png and svg in it
//   jobs        how many files are captured at the same time
//   all         every bundled game
//   b18Version, b18Author  1.0, the author of the user's config or their name
//   debug       serve the site and wait
const command = async (game, opts = {}) => {
  const user = flagOptions(opts);
  const jobs = parseCount(opts.jobs, "--jobs", 1);

  if (opts.debug) {
    setup();
    startServer();
    console.log("Debug Mode");
    console.log("Starting the server on http://localhost:9000");
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

  const userConfig = opts.config ? loadConfigFile(opts.config) : {};
  const data = loadExportData();
  const failed = [];
  const root = opts.out || "render";

  // The games are resolved first, a mistake in one is a mistake before any
  // file is written
  const resolved = [];
  for (const name of names) {
    const found = await resolveGame(name);
    // The flags on top of the `exports` of the game
    const options = resolveExportOptions({
      defaults: { b18: { author: userInfo().username } },
      game: found.game.exports,
      // The config of the user is between the game and the flags
      user: {
        layouts: layoutsOfConfig(mergeDeepRight(customConfig, userConfig)),
        ...user,
      },
    });
    if (
      options.variation !== undefined &&
      Array.isArray(found.game.map) &&
      options.variation >= found.game.map.length
    ) {
      throw new UsageError(
        `${found.id} has no map variation ${options.variation}`,
      );
    }
    resolved.push({ ...found, options });
  }

  await withBrowser(async ({ browser, baseUrl }) => {
    for (const { id, game: gameDef, options } of resolved) {
      const { formats, docs, variation } = options;
      let config = loadGameConfig(gameDef, userConfig);
      if (options.layouts) {
        config = mergeDeepRight(config, {
          export: { allLayouts: options.layouts === "all" },
        });
      }
      const exportData = { ...data, slug: renderSlug(id) };
      const out = gameFolder(root, id);
      const run = (list) =>
        exportGame({
          capture: createCapture({
            browser,
            baseUrl,
            dpi: options.png.dpi,
            background: options.background,
            // The page is given the game and the config of the layers below
            // the game's own, like the sizes are planned with
            input: {
              id,
              game: renderGame(gameDef, id),
              config: mergeDeepRight(customConfig, userConfig),
            },
          }),
          jobs: list,
          out,
          concurrency: jobs,
        });

      const files = formats.filter((format) => format !== "b18");
      if (files.length > 0) {
        // Every format has its own folder in the folder of the game
        const list = formatFolder(
          exportJobs(
            gameDef,
            selectDocs(
              documents(gameDef, config, exportData, {
                cardBleed: options.cards.bleed,
              }),
              { docs, variation },
            ),
            files,
          ),
        );
        if (list.length === 0) {
          console.error(
            `Nothing to export for ${id}: the chosen documents have no ${files.join(", ")} files`,
          );
          process.exitCode = 1;
        }
        failed.push(...(await run(list)));
      }

      if (formats.includes("b18")) {
        const spec = b18Spec(gameDef, config, exportData, {
          id,
          slug: renderSlug(id),
          version: options.b18.version,
          author: options.b18.author,
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
