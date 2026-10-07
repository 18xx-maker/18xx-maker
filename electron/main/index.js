import os from "node:os";

import { app, dialog, ipcMain } from "electron";
import updater from "electron-updater";

import { objOf } from "ramda";

import { createAddRecent, fromMainWindow } from "#export/ipc";
import { exportOf } from "./capture.js";
import {
  CONFIG_FILE,
  addRecent,
  deleteGame,
  getConfig,
  getSummaries,
  getSummary,
  slugOfPath,
} from "./config.js";
import { registerExport } from "./export.js";
import { TYPE, loadGame, openGame, saveGamePath } from "./game.js";
import { assertGamePath, guardHandle, guardOn, guardSync } from "./guard.js";
import { createLoadGame } from "./loadGame.js";
import { setMenu } from "./menu.js";
import { createNewGame } from "./newGame.js";
import { createSaveGame, createSaveGameAs } from "./saveFile.js";
import { send } from "./util.js";
import { stopWatching, watch } from "./watch.js";
import { createWindow, getMainWindow, startBaseUrl } from "./window.js";

// Only the main window may use the channels of the app
const isMain = (event) => fromMainWindow(event, getMainWindow(), startBaseUrl);
const handle = (channel, handler) =>
  ipcMain.handle(channel, guardHandle(isMain, handler));
const on = (channel, handler) => ipcMain.on(channel, guardOn(isMain, handler));

const { autoUpdater } = updater;
autoUpdater.autoDownload = false;

// To test updating in dev uncomment this line:
// autoUpdater.forceDevUpdateConfig = true;

// You will also need a file in the repo root called dev-app-update.yml with the
// following content:
// owner: 18xx-maker
// repo: 18xx-maker
// provider: github
// updaterCacheDirName: 18xx-maker-updater

app.on("ready", () => {
  const mainWindow = createWindow();

  autoUpdater.on("checking-for-update", () => {
    send("update", { checking: true });
  });
  autoUpdater.on("error", (error) => {
    send("update", { checking: false, available: false, error });
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

  mainWindow.on("ready-to-show", () =>
    autoUpdater
      .checkForUpdates()
      .then((result) => {
        if (!result) {
          send("update", { checking: false, available: false, dev: true });
        }

        return result;
      })
      // The updater reports its errors as events
      .catch((e) => console.error("Unable to check for updates:", e)),
  );
});
app.on("activate", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

on("checkForUpdates", () =>
  autoUpdater
    .checkForUpdates()
    .catch((e) => console.error("Unable to check for updates:", e)),
);
on("downloadUpdate", () =>
  autoUpdater
    .downloadUpdate()
    .catch((e) => console.error("Unable to download the update:", e)),
);
on("deleteGame", (event, id) => {
  stopWatching(id);
  deleteGame(id);
  setMenu();
});

handle("saveGamePath", (event, path) => saveGamePath(assertGamePath(path)));

const getPlatformAndVersions = () => ({
  platform: os.platform(),
  versions: {
    app: app.getVersion(),
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    system: process.getSystemVersion(),
  },
});
ipcMain.on(
  "loadPlatformAndVersions",
  guardSync(isMain, (event) => {
    event.returnValue = getPlatformAndVersions();
  }),
);
handle("loadConfig", () =>
  Promise.resolve({
    config: getConfig(),
    path: CONFIG_FILE,
    ...getPlatformAndVersions(),
  }),
);

handle("loadSummaries", () => Promise.resolve(objOf(TYPE, getSummaries())));
handle(
  "loadGame",
  createLoadGame({
    summaryOf: getSummary,
    loadGame,
    watch,
    stopWatching,
    deleteGame,
  }),
);

handle("openGame", () => openGame());

ipcMain.handle(
  "newGame",
  createNewGame({
    isMain,
    showSaveDialog: (options) =>
      dialog.showSaveDialog(getMainWindow(), options),
    saveGamePath,
    slugOfPath,
  }),
);

ipcMain.handle(
  "saveGameAs",
  createSaveGameAs({
    isMain,
    showSaveDialog: (options) =>
      dialog.showSaveDialog(getMainWindow(), options),
    saveGamePath,
    slugOfPath,
  }),
);

ipcMain.handle(
  "saveGame",
  createSaveGame({
    isMain,
    summaryOf: (id) => getConfig().summaries[id],
    afterSave: (id) => watch(id),
  }),
);

on(
  "addRecent",
  createAddRecent({
    isCapture: (sender) => exportOf(sender) !== undefined,
    addRecent,
    afterAdd: () => setMenu(),
  }),
);

registerExport();
