import Promise from "bluebird";
import { app, ipcMain } from "electron";
import { objOf } from "ramda";

import {
  addRecent,
  deleteGame,
  getConfig,
  getSummaries,
  getSummary,
} from "./config.js";
import { exportPDF, exportPNG, pdf, png } from "./export.js";
import { createWindow } from "./window.js";
import { TYPE, loadGame, openGame, saveGamePath } from "./game.js";
import { setMenu } from "./menu.js";
import { stopWatching, watch } from "./watch.js";

app.on("ready", createWindow);
app.on("activate", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("deleteGame", (event, id) => {
  stopWatching(getSummary(id).path);
  deleteGame(id);
});

ipcMain.handle("saveGamePath", (event, path) => saveGamePath(path));

ipcMain.handle("loadSummaries", () =>
  Promise.resolve(objOf(TYPE, getSummaries())),
);

ipcMain.handle("loadGame", (event, id) => {
  let config = getConfig();
  let summary = config.summaries[id];

  if (!summary) {
    return Promise.reject(new Error(`Electron game ${id} not found`));
  }

  watch(summary.path);
  return loadGame(summary.path).catch((e) => {
    deleteGame(id);
    throw e;
  });
});

ipcMain.handle("openGame", openGame);

ipcMain.on("addRecent", (event, title, slug) => {
  addRecent(title, slug);
  setMenu();
});

ipcMain.on("exportPDF", (event, game, items) => exportPDF(game, items));
ipcMain.on("exportPNG", (event, game, items) => exportPNG(game, items));
ipcMain.on("pdf", (event, path) => pdf(path));
ipcMain.on("png", (event, path) => png(path));
