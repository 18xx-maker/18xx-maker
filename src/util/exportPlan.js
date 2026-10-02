import { mergeDeepRight, uniq } from "ramda";

import { companies as companyOverrides, tiles } from "@/data";
import { b18Spec } from "@/export/b18.js";
import { MAX_DPI } from "@/export/capture.js";
import { documents } from "@/export/documents.js";
import { exportJobs, fileName, safeName } from "@/export/names.js";
import { renderSlug } from "@/export/render.js";
import { docPage, selectDocs } from "@/export/select.js";
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
  );

// If the config exports every layout of a sheet
export const allLayouts = (game, layers) =>
  !!baseConfig(layers, game).export?.allLayouts;

// What the main process exports for a game:
//   { id, game, config, jobs, dpi, title, b18 }
// see createExportService. The options are
//   formats    "pdf", "png", "b18"
//   docs       the pages to export (exportPages), all when left out
//   layouts    "all" for a sheet of every layout, "current" for the one config
//              has, as config says when left out
//   paginated  also the paginated pdfs, true when left out
//   dpi        of the pngs, at most MAX_DPI
//   b18        { version, author } of the Board 18 box
export const planExport = (
  game,
  layers,
  {
    formats,
    docs,
    layouts: layoutChoice,
    paginated = true,
    dpi = MAX_DPI,
    b18,
  },
) => {
  let config = baseConfig(layers, game);
  if (layoutChoice) {
    config = mergeDeepRight(config, {
      export: { allLayouts: layoutChoice === "all" },
    });
  }
  const data = exportData(game);
  const files = formats.filter((format) => format !== "b18");
  const jobs = exportJobs(
    game,
    selectDocs(documents(game, config, data), { docs, paginated }),
    files,
  );

  let box;
  if (formats.includes("b18")) {
    const spec = b18Spec(game, config, data, {
      id: game.meta.id,
      slug: data.slug,
      version: b18.version,
      author: b18.author,
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
    dpi,
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
    dpi: MAX_DPI,
    single: true,
  };
};
