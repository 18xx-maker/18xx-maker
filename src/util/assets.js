// Built-in and custom images behind one lookup.
//
// The API (the name rules are in util/assetNames, a module with no imports that
// Electron main and the CLI can import as plain Node; this one is renderer
// code, it imports the images of the app):
//
//   resolveAsset(kind, id, assets)
//     kind    "icons" | "logos" | "trains"
//     id      what the game JSON says: a built-in name ("boat", "dev/apple",
//             "3") or "custom/<name>"
//     assets  the runtime asset map (see util/assetNames):
//             { icons: {name: svgText}, logos: {name: svgText},
//               trains: {name: "data:image/png;base64,..."} }, keyed by the
//             name without "custom/"; may be undefined
//     gives   icons and logos: a component to render inside an svg, used with
//             width, height, x, y and className like the built-in ones
//             trains: the url of the image
//             undefined when there is none. A custom id never falls back to
//             a built-in one and a built-in one is never shadowed.
//   customIds(kind, assets)  the "custom/<name>" ids of the map, sorted
//   sanitizeAssets(assets)   a map that is safe to keep and render (names,
//                            sizes, PNG headers and SVG documents checked,
//                            bad entries dropped), used where a map comes in:
//                            the folder loader, IndexedDB, render input
//   useAssets()              (hooks/assets) the assets of the game on screen
import { createElement } from "react";

import CustomSvg from "@/components/atoms/CustomSvg";

import { icons, logos, trainImages } from "@/data";
import {
  KINDS,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  PNG_DATA_URI,
  assetBytes,
  assetProblem,
  customId,
  customName,
  emptyAssets,
  isCustomId,
  isValidName,
  maxBytes,
  pngBytes,
  sameName,
} from "@/util/assetNames";
import { sanitizeSvg } from "@/util/svgSanitize";

export {
  CUSTOM_PREFIX,
  KINDS,
  customId,
  customName,
  isCustomId,
} from "@/util/assetNames";

const BUILT_IN = { icons, logos, trains: trainImages };

// One component per SVG text, so React keeps the same type between renders
const components = new Map();
const customComponent = (svg) => {
  let Component = components.get(svg);
  if (!Component) {
    if (components.size >= 500)
      components.delete(components.keys().next().value);
    Component = function CustomImage(props) {
      return createElement(CustomSvg, { svg, ...props });
    };
    components.set(svg, Component);
  }
  return Component;
};

export const resolveAsset = (kind, id, assets) => {
  if (!KINDS.includes(kind) || typeof id !== "string") return undefined;

  if (isCustomId(id)) {
    const map = assets?.[kind];
    const name = customName(id);
    if (!map || !Object.hasOwn(map, name)) return undefined;
    return kind === "trains" ? map[name] : customComponent(map[name]);
  }

  const builtIn = BUILT_IN[kind];
  return Object.hasOwn(builtIn, id) ? builtIn[id] : undefined;
};

export const customIds = (kind, assets) =>
  Object.keys(assets?.[kind] ?? {})
    .sort()
    .map(customId);

const validEntry = (kind, name, value) => {
  if (!isValidName(name) || typeof value !== "string") return false;
  if (kind === "trains") {
    return (
      PNG_DATA_URI.test(value) &&
      assetBytes(kind, value) <= maxBytes(kind) &&
      assetProblem(kind, name, pngBytes(value)) === null
    );
  }
  return assetBytes(kind, value) <= maxBytes(kind) && !!sanitizeSvg(value);
};

export const sanitizeAssets = (assets) => {
  const clean = emptyAssets();
  let count = 0;
  let bytes = 0;
  for (const kind of KINDS) {
    const map = assets?.[kind];
    if (!map || typeof map !== "object") continue;
    for (const name of Object.keys(map).sort()) {
      const value = map[name];
      if (
        !validEntry(kind, name, value) ||
        Object.keys(clean[kind]).some((existing) => sameName(existing, name))
      ) {
        continue;
      }
      const size = assetBytes(kind, value);
      if (count + 1 > MAX_FILES || bytes + size > MAX_TOTAL_BYTES) continue;
      clean[kind][name] = value;
      count += 1;
      bytes += size;
    }
  }
  return clean;
};
