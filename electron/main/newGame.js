import nodeFs from "node:fs";

import { newGameFilename, newGameJson } from "#util/newGame";

export const MAX_TITLE = 200;

// The handler of the newGame channel. The page only sends a title: the file
// is the one the user picks in the save dialog and its content is the template,
// never anything from the page. Gives the slug of the game, or undefined when
// the dialog is cancelled.
export const createNewGame =
  ({ isMain, showSaveDialog, saveGamePath, slugOfPath, fs = nodeFs }) =>
  async (event, title) => {
    if (!isMain(event))
      throw new Error("Creating a game is not available here");
    if (typeof title !== "string" || title.length > MAX_TITLE) {
      throw new Error("Invalid game title");
    }

    const name = title.trim() || "New Game";
    const { canceled, filePath } = await showSaveDialog({
      title: "Save new game",
      defaultPath: `${newGameFilename(name)}.json`,
      properties: ["showOverwriteConfirmation", "createDirectory"],
      filters: [{ name: "18xx-maker Game", extensions: ["json"] }],
    });
    if (canceled || !filePath) return undefined;

    // The dialog confirms an overwrite of the name the user typed, not of the
    // name with .json added, so that one is never overwritten
    const typed = /\.json$/i.test(filePath);
    const path = typed ? filePath : `${filePath}.json`;
    try {
      fs.writeFileSync(path, newGameJson(name), typed ? {} : { flag: "wx" });
    } catch (e) {
      if (e?.code === "EEXIST")
        throw new Error(`${path} already exists`, { cause: e });
      throw e;
    }

    return slugOfPath(path) ?? (await saveGamePath(path));
  };
