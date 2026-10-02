// The options of an export, from the layers they can be set in. Lowest to
// highest:
//   1. the built in defaults (and the defaults of the caller, see below)
//   2. the `exports` field of the game file
//   3. what the user chose: flags of maker export, the user's config, the
//      choices in the export options panel
// The CLI and the app both resolve with this, so they agree.
// Plain JS: no Node APIs, no DOM.
import { MAX_DPI } from "./capture.js";
import { DOCS } from "./select.js";

export const FORMATS = ["pdf", "png", "b18"];
export const LAYOUTS = ["all", "current"];

// What an export does when nothing says otherwise. Not set: docs (every
// page), layouts (the export.allLayouts setting of the config), variation
// (every one) and the author of a Board18 box (it depends on who exports).
export const DEFAULTS = {
  formats: ["pdf"],
  paginated: false,
  png: { dpi: MAX_DPI },
  b18: { version: "1.0" },
};

const isList = (value, valid) =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((item) => valid.includes(item));
const isText = (value) => typeof value === "string" && value.length > 0;

// The valid options of a layer, in the shape of the `exports` field:
//   { formats, docs, layouts, paginated, variation,
//     png: { dpi }, b18: { version, author } }
// What is left out, undefined or not valid is not in the result. The schema
// of the game rejects invalid options of a game file; a game that the app
// loaded was not checked, so its mistakes are skipped here instead of failing
// an export.
export const cleanOptions = (layer) => {
  const given = layer && typeof layer === "object" ? layer : {};
  const out = {};
  if (isList(given.formats, FORMATS)) out.formats = [...new Set(given.formats)];
  if (isList(given.docs, DOCS)) out.docs = [...new Set(given.docs)];
  if (LAYOUTS.includes(given.layouts)) out.layouts = given.layouts;
  if (typeof given.paginated === "boolean") out.paginated = given.paginated;
  if (Number.isInteger(given.variation) && given.variation >= 0) {
    out.variation = given.variation;
  }

  const dpi = given.png?.dpi;
  if (Number.isInteger(dpi) && dpi >= 1 && dpi <= MAX_DPI) out.png = { dpi };

  const b18 = {};
  if (isText(given.b18?.version)) b18.version = given.b18.version;
  if (isText(given.b18?.author)) b18.author = given.b18.author;
  if (Object.keys(b18).length > 0) out.b18 = b18;
  return out;
};

const merge = (low, high) => ({
  ...low,
  ...high,
  png: { ...low.png, ...high.png },
  b18: { ...low.b18, ...high.b18 },
});

// The options of an export:
//   game      the `exports` field of the game file
//   user      what the user chose, same shape
//   defaults  the defaults of the caller, on top of DEFAULTS (the app has
//             paginated pdfs by default, maker export does not)
// Returns every option: { formats, docs, layouts, paginated, variation,
// png: { dpi }, b18: { version, author } }
export const resolveExportOptions = ({ game, user, defaults } = {}) =>
  [defaults, game, user]
    .map(cleanOptions)
    .reduce(merge, merge(DEFAULTS, { png: {}, b18: {} }));

// The layouts option a config of the user has: its export.allLayouts setting,
// undefined when it has none. Pass only the user's own layers (user config,
// stored config), not the defaults, so that only a choice of the user is on
// top of the `exports` of a game.
export const layoutsOfConfig = (config) => {
  const chosen = config?.export?.allLayouts;
  return typeof chosen === "boolean" ? (chosen ? "all" : "current") : undefined;
};
