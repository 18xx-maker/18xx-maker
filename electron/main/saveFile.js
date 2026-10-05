import nodeFs from "node:fs";

import { equals } from "ramda";

// Writes the text of a game over its file, in place: the file keeps its
// permissions and links. When `expected` is given (the game as the app loaded
// it, without meta) and the file is not that game any more, nothing is written
// and the result is { conflict: true }. Otherwise { previous }, the game the
// file had (null when it was not a game).
export const saveGameText = (path, text, expected, fs = nodeFs) => {
  let previous = null;
  try {
    previous = JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    // A file that is gone or no JSON has nothing to lose, unless the app
    // expected a game there
  }

  if (expected && !equals(previous, expected)) {
    return { conflict: true };
  }

  fs.writeFileSync(path, text);
  return { previous };
};

// The handler of the saveGame channel. The page names a game by id, the path
// is the one of the config, never one from the page.
export const createSaveGame =
  ({ isMain, summaryOf, afterSave, fs }) =>
  (event, id, text, expected) => {
    if (!isMain(event)) throw new Error("Saving is not available here");
    if (typeof id !== "string" || typeof text !== "string") {
      throw new Error("Invalid game to save");
    }

    const summary = summaryOf(id);
    if (!summary) throw new Error(`Electron game ${id} not found`);

    const result = saveGameText(summary.path, text, expected, fs);
    if (!result.conflict) afterSave(id);
    return result;
  };
