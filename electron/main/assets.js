import { loadAssetFolder } from "#export/assets";
import { emptyAssets } from "#util/assetNames";

// The custom images of the games of the app (util/assetNames), read from the
// <game>.assets folder next to each game file. The path is the one of the
// config's summary, never one from the page.
//
// summaryOf(id)   the summary of an electron game, with its path
// load(path)      loadAssetFolder: { assets, warnings }
// log(message)    where the files that were skipped are reported
export const createFolderAssets = ({
  summaryOf,
  load = loadAssetFolder,
  log = console.warn,
}) => {
  // The images of a game by id, an empty map for a game that is not known
  const of = (id) => {
    const summary = typeof id === "string" ? summaryOf(id) : undefined;
    if (!summary) return emptyAssets();
    const { assets, warnings } = load(summary.path);
    for (const warning of warnings) log(`Assets: ${warning}`);
    return assets;
  };

  // The images of an export request (see createExportService assetsOf): the
  // folder of the game when the request is for an electron game, undefined
  // for the others, whose images the request itself carries
  const ofRequest = (request) =>
    request?.game?.meta?.type === "electron" ? of(request.id) : undefined;

  return {
    of,
    ofRequest,
    // The loadAssets channel: the page sanitizes what it gets
    handler: (event, id) => of(id),
  };
};
