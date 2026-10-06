import nodeFs from "node:fs";

import { titleToFilename } from "#util/index";
import { newGameJson } from "#util/newGame";

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
      defaultPath: `${titleToFilename(name)}.json`,
      filters: [{ name: "18xx-maker Game", extensions: ["json"] }],
    });
    if (canceled || !filePath) return undefined;

    const path = /\.json$/i.test(filePath) ? filePath : `${filePath}.json`;
    fs.writeFileSync(path, newGameJson(name));

    return slugOfPath(path) ?? (await saveGamePath(path));
  };
