import fs from "node:fs";

import chokidar from "chokidar";

import { addRecent, getSummary } from "./config.js";
import { loadGame } from "./game.js";
import { setMenu } from "./menu.js";
import { send } from "./util.js";
import { createWatcher } from "./watcher.js";

export const { watch, stopWatching } = createWatcher({
  summaryOf: getSummary,
  exists: fs.existsSync,
  chokidar,
  loadGame,
  onGame: (game) => {
    send("game", game);
    addRecent(game.info.title, game.meta.slug);
    setMenu();
  },
});
