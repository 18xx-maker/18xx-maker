import os from "node:os";

import Promise from "bluebird";
import { app, ipcMain } from "electron";
import updater from "electron-updater";

import { objOf } from "ramda";

import {
  CONFIG_FILE,
  addRecent,
  deleteGame,
  getConfig,
  getSummaries,
  getSummary,
} from "./config.js";
import { exportPDF, exportPNG, pdf, png } from "./export.js";
import { TYPE, loadGame, openGame, saveGamePath } from "./game.js";
import { setMenu } from "./menu.js";
import { send } from "./util.js";
import { stopWatching, watch } from "./watch.js";
import { createWindow } from "./window.js";

const { autoUpdater } = updater;
autoUpdater.autoDownload = false;
autoUpdater.forceDevUpdateConfig = true;

app.on("ready", () => {
  const mainWindow = createWindow();

  autoUpdater.on("checking-for-update", () => {
    send("update", { checking: true });
  });
  autoUpdater.on("update-not-available", (info) => {
    send("update", { checking: false, available: false, info });
  });
  autoUpdater.on("update-available", (info) => {
    send("update", { checking: false, available: true, info });
  });
  autoUpdater.on("download-progress", (info) => {
    send("downloadProgress", info.percent);
  });
  autoUpdater.on("update-downloaded", () => {
    autoUpdater.quitAndInstall();
  });

  mainWindow.on("ready-to-show", () => autoUpdater.checkForUpdates());
});
app.on("activate", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("downloadUpdate", () => autoUpdater.downloadUpdate());
ipcMain.on("deleteGame", (event, id) => {
  stopWatching(getSummary(id).path);
  deleteGame(id);
});

ipcMain.handle("saveGamePath", (event, path) => saveGamePath(path));
ipcMain.handle("loadConfig", () =>
  Promise.resolve({
    config: getConfig(),
    path: CONFIG_FILE,
    platform: os.platform(),
    versions: {
      app: app.getVersion(),
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      system: process.getSystemVersion(),
    },
  }),
);
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
