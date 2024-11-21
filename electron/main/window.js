import updater from "electron-updater";
import { app, dialog, BrowserWindow } from "electron";
import { join } from "node:path";

import { setMenu } from "./menu.js";

const { autoUpdater } = updater;

export const isDev =
  Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1 || !app.isPackaged;

export const startUrl =
  isDev && process.env["ELECTRON_RENDERER_URL"]
    ? process.env["ELECTRON_RENDERER_URL"]
    : `file://${join(__dirname, "../renderer/index.html")}`;

let mainWindow = null;

export const getMainWindow = () => mainWindow;

export const createWindow = () => {
  if (mainWindow) {
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/preload.mjs"),
      sandbox: false,
    },
  });
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.maximize();
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "allow" }));
  mainWindow.loadURL(startUrl);

  setMenu(mainWindow);
  autoUpdater.checkForUpdatesAndNotify();

  return mainWindow;
};

export const captureWindow = () => {
  return new BrowserWindow({
    x: 0,
    y: 0,
    enableLargerThanScreen: true,
    show: false,
    transparent: true,
    frame: false,
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/preload.mjs"),
      sandbox: false,
    },
  });
};

export const selectDirectory = (title = "Select directory") => {
  return dialog
    .showOpenDialog(mainWindow, {
      title,
      properties: ["openDirectory", "createDirectory"],
    })
    .then(({ canceled, filePaths }) => {
      if (canceled) {
        return undefined;
      } else {
        return filePaths[0];
      }
    });
};
