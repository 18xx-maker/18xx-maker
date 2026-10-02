import { companies as companyOverrides, tiles } from "@/data";
import { b18Spec } from "@/export/b18.js";
import { documents } from "@/export/documents.js";
import { docPath, exportJobs } from "@/export/names.js";
import schema from "@/schemas/config.schema.json";

const layouts = (name) => schema.properties[name].properties.layout.enum;

// What the export list needs that the CLI loads from disk
const exportData = (game) => ({
  slug: game.meta.slug,
  tiles,
  companyOverrides,
  layouts: {
    cards: layouts("cards"),
    tiles: layouts("tiles"),
    tokens: layouts("tokens"),
  },
  plainSheetNames: true,
});

// The files of one format the app exports for a game, as the list the main
// process captures: [{ route, name }], the page and the name of the file
export const planExport = (game, config, format) =>
  exportJobs(game, documents(game, config, exportData(game)), [format]).map(
    ({ doc, path }) => ({ route: docPath(doc), name: path }),
  );

// The Board 18 box of a game, for the main process to capture and zip:
// { names, json, images: [{ route, name, path, width, height, transparent }] }
export const planB18 = (game, config, { version, author }) => {
  const { names, json, images } = b18Spec(game, config, exportData(game), {
    id: game.meta.id,
    slug: game.meta.slug,
    version,
    author,
  });

  return {
    names,
    json,
    images: images.map(({ path, capture, ...doc }) => ({
      route: docPath(doc),
      path,
      width: capture.viewport.w,
      height: capture.viewport.h,
      transparent: capture.transparent,
    })),
  };
};
