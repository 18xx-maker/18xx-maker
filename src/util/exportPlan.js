import { mergeDeepRight, uniq } from "ramda";

import { companies as companyOverrides, tiles } from "@/data";
import { b18Spec } from "@/export/b18.js";
import { documents } from "@/export/documents.js";
import { exportJobs, fileName, safeName } from "@/export/names.js";
import { layoutsOfConfig, resolveExportOptions } from "@/export/options.js";
import { renderSlug } from "@/export/render.js";
import { DOCS, docPage, selectDocs } from "@/export/select.js";
import schema from "@/schemas/config.schema.json";
import { resolveConfig } from "@/util/resolveConfig";

const layouts = (name) => schema.properties[name].properties.layout.enum;

// What the export list needs that the CLI loads from disk. The routes are the
// ones of the game in render mode, where the capture windows show it.
const exportData = (game) => ({
  slug: renderSlug(game.meta.id),
  tiles,
  companyOverrides,
  layouts: {
    cards: layouts("cards"),
    tiles: layouts("tiles"),
    tokens: layouts("tokens"),
  },
  plainSheetNames: true,
});

// The layers of the config the export starts from, as useConfig has them:
// { defaultConfig, userConfig, storedConfig }. The capture windows get
// the layers below the URL parameters and the game's own config, the page
// puts the rest on top, so the list is planned with the same config.
const baseConfig = ({ defaultConfig, userConfig, storedConfig }, game) =>
  resolveConfig({
    defaults: defaultConfig,
    user: userConfig,
    stored: storedConfig,
    gameConfig: game.config,
  }).config;

// The pages of a game that can be exported (see DOCS), for the options
export const exportPages = (game, layers) =>
  uniq(
    documents(game, baseConfig(layers, game), exportData(game)).map(docPage),
  ).filter((page) => DOCS.includes(page));

// If the config exports every layout of a sheet
export const allLayouts = (game, layers) =>
  !!baseConfig(layers, game).export?.allLayouts;

// What the app exports when nothing else says: it has the paginated pdfs, and
// the designer of the game is the author of a Board18 box
const appDefaults = (game) => ({
  paginated: true,
  b18: { author: game.info.designer || "18xx Maker" },
});

// The options of an export of the game, in the order of the `exports` field of
// the game (see resolveExportOptions): the defaults of the app, the game's
// `exports` and what the user chose. userOptions are
//   { formats, docs, layouts, paginated, background, dpi, variation,
//     b18: { version, author } }
// with what is left out coming from the layers below. A variation of null is
// every variation, also when the game's `exports` has one.
const resolveOptions = (game, layers, userOptions = {}) => {
  const { dpi, ...user } = userOptions;
  return resolveExportOptions({
    defaults: appDefaults(game),
    game: game.exports,
    user: {
      ...user,
      layouts:
        user.layouts ??
        layoutsOfConfig(
          mergeDeepRight(layers.userConfig || {}, layers.storedConfig || {}),
        ),
      png: { dpi },
    },
  });
};

// What the options panel starts with: the options of the export before the
// user changes any. docs is every page of the game when `exports` has none,
// variation is null for every variation (also when `exports` has one that
// the game does not have).
export const exportDefaults = (game, layers) => {
  const options = resolveOptions(game, layers);
  const pages = exportPages(game, layers);
  return {
    formats: options.formats,
    docs: options.docs ? pages.filter((p) => options.docs.includes(p)) : pages,
    layouts: options.layouts ?? (allLayouts(game, layers) ? "all" : "current"),
    paginated: options.paginated,
    background: options.background,
    variation:
      Array.isArray(game.map) && options.variation < game.map.length
        ? options.variation
        : null,
    dpi: options.png.dpi,
    b18: options.b18,
  };
};

// What the main process exports for a game:
//   { id, game, config, jobs, dpi, background, title, b18 }
// see createExportService. The options are
//   formats    "pdf", "png", "b18"
//   docs       the pages to export (exportPages), all when left out
//   layouts    "all" for a sheet of every layout, "current" for the one config
//              has, as config says when left out
//   paginated  also the paginated pdfs
//   background "transparent" or "white", of the png and b18 images (tokens and
//              tiles are always transparent)
//   dpi        of the pngs, at most MAX_DPI
//   variation  only this map variation
//   b18        { version, author } of the Board 18 box
// What is left out is the `exports` of the game, or the default of the app
// (resolveExportOptions).
export const planExport = (game, layers, userOptions) => {
  const options = resolveOptions(game, layers, userOptions);
  const { formats, docs, paginated, variation } = options;
  let config = baseConfig(layers, game);
  if (options.layouts) {
    config = mergeDeepRight(config, {
      export: { allLayouts: options.layouts === "all" },
    });
  }
  const data = exportData(game);
  const files = formats.filter((format) => format !== "b18");
  const jobs = exportJobs(
    game,
    selectDocs(documents(game, config, data), { docs, paginated, variation }),
    files,
  );

  let box;
  if (formats.includes("b18")) {
    const spec = b18Spec(game, config, data, {
      id: game.meta.id,
      slug: data.slug,
      version: options.b18.version,
      author: options.b18.author,
      variation,
    });
    jobs.push(...exportJobs(game, spec.images, ["b18"]));
    // Only the names that are data, the others are functions
    const { folder, zip, json } = spec.names;
    box = { names: { folder, zip, json }, json: spec.json };
  }

  return {
    id: game.meta.id,
    game,
    config: mergeDeepRight(layers.userConfig, layers.storedConfig),
    jobs,
    dpi: options.png.dpi,
    background: options.background,
    b18: box,
  };
};

// What the main process exports for the page the app shows: a pdf or png of
// "/games/1889/map?variation=0" (location.pathname and location.search),
// saved under a name the user chooses. A png is of the .printElement.
export const planSingle = (game, layers, { pathname, search }, format) => {
  const page = pathname.split("/").slice(3).join("/");
  const doc = {
    route: `/games/${renderSlug(game.meta.id)}/${page}`,
    query: Object.fromEntries(new URLSearchParams(search)),
    basename: safeName(page.replace(/\//g, "-")) || "game",
    capture: { selector: ".printElement", viewport: null, transparent: false },
  };

  return {
    id: game.meta.id,
    game,
    config: mergeDeepRight(layers.userConfig, layers.storedConfig),
    jobs: [{ doc, format, path: fileName(game, doc, format) }],
    ...(({ png, background }) => ({ dpi: png.dpi, background }))(
      resolveOptions(game, layers),
    ),
    single: true,
  };
};
