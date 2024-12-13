import fs from "node:fs";

import chokidar from "chokidar";

import { addRecent, getConfig } from "./config.js";
import { loadGame } from "./game.js";
import { setMenu } from "./menu.js";
import { send } from "./util.js";

let watching = null;
let watcher = null;

export const stopWatching = (id) => {
  const config = getConfig();
  const summary = config.summaries[id];

  if (watching === summary.path) {
    watching = null;

    if (watcher) {
      watcher.close();
      watcher = null;
    }
  }
};

export const watch = (id) => {
  const config = getConfig();
  const summary = config.summaries[id];

  if (watcher) watcher.close();

  // Don't watch non-existent files
  if (!fs.existsSync(summary.path)) {
    watching = null;
    watcher = null;
    return;
  }

  watching = summary.path;
  watcher = chokidar.watch(summary.path);

  watcher.on("change", () =>
    loadGame(id).then((game) => {
      send("game", game);
      addRecent(game.info.title, game.meta.slug);
      setMenu();
    }),
  );

  return id;
};
