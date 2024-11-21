import chokidar from "chokidar";
import fs from "node:fs";

import { addRecent } from "./config.js";
import { loadGame } from "./game.js";
import { send } from "./util.js";
import { setMenu } from "./menu.js";

let watching = null;
let watcher = null;

export const stopWatching = (path) => {
  if (watching === path) {
    watching = null;

    if (watcher) {
      watcher.close();
      watcher = null;
    }
  }
};

export const watch = (path) => {
  if (watcher) watcher.close();

  // Don't watch non-existent files
  if (!fs.existsSync(path)) {
    watching = null;
    watcher = null;
    return;
  }

  watching = path;
  watcher = chokidar.watch(path);

  watcher.on("change", () =>
    loadGame(path).then((game) => {
      send("game", game);
      addRecent(game.info.title, game.meta.slug);
      setMenu();
    }),
  );

  return path;
};
