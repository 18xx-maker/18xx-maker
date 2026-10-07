import nodeFs from "node:fs";

import { equals } from "ramda";

import { sanitizeFilename } from "#util/filename";

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

export const MAX_LABEL = 200;
const MAX_TEXT = 100 * 1024 * 1024;

// The handler of the saveGameAs channel: a copy of a game that has no file
// (a bundled game) saved where the user chooses. The page sends the suggested
// name, the text and the (translated) labels of the dialog; the path is only
// ever the one the save dialog returns, never one from the page. Gives the
// slug of the new game, or undefined when the dialog is cancelled.
export const createSaveGameAs =
  ({ isMain, showSaveDialog, saveGamePath, slugOfPath, fs = nodeFs }) =>
  async (event, name, text, title, filterName) => {
    if (!isMain(event)) throw new Error("Saving is not available here");
    if (
      typeof name !== "string" ||
      name.length > MAX_LABEL ||
      typeof text !== "string" ||
      text.length > MAX_TEXT ||
      typeof title !== "string" ||
      title.length > MAX_LABEL ||
      typeof filterName !== "string" ||
      filterName.length > MAX_LABEL
    ) {
      throw new Error("Invalid game to save");
    }

    const { canceled, filePath } = await showSaveDialog({
      title,
      defaultPath: `${sanitizeFilename(name) || "game"}.json`,
      properties: ["showOverwriteConfirmation", "createDirectory"],
      filters: [{ name: filterName, extensions: ["json"] }],
    });
    if (canceled || !filePath) return undefined;

    // The dialog confirms an overwrite of the name the user typed, not of the
    // name with .json added, so that one is never overwritten
    const typed = /\.json$/i.test(filePath);
    const path = typed ? filePath : `${filePath}.json`;
    try {
      fs.writeFileSync(path, text, typed ? {} : { flag: "wx" });
    } catch (e) {
      if (e?.code === "EEXIST")
        throw new Error(`${path} already exists`, { cause: e });
      throw e;
    }

    return slugOfPath(path) ?? (await saveGamePath(path));
  };
