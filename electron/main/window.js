import { join } from "node:path";

import { BrowserWindow, shell } from "electron";

import { nth, split } from "ramda";

import { navigationGuard, windowOpenHandler } from "#export/ipc";
import { getLastRoute, setLastRoute } from "./config.js";
import { isDev } from "./dev.js";
import { setMenu } from "./menu.js";

export const lastRoute = getLastRoute();
export const rootUrl = `file://${join(import.meta.dirname, "../renderer/index.html")}`;
export const startBaseUrl =
  isDev && process.env["ELECTRON_RENDERER_URL"]
    ? process.env["ELECTRON_RENDERER_URL"]
    : rootUrl;
export const startUrl = lastRoute
  ? `${startBaseUrl}#${lastRoute}`
  : startBaseUrl;

let mainWindow = null;

export const getMainWindow = () => mainWindow;

export const createWindow = () => {
  if (mainWindow) {
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/preload.cjs"),
    },
  });
  mainWindow.on("close", () =>
    setLastRoute(nth(1, split("#", mainWindow.webContents.getURL()))),
  );
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.maximize();
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler(
    windowOpenHandler((url) => shell.openExternal(url)),
  );
  // The window only shows the app
  mainWindow.webContents.on(
    "will-navigate",
    navigationGuard(startBaseUrl, (url) => shell.openExternal(url)),
  );
  mainWindow.loadURL(startUrl);

  setMenu(mainWindow);

  return mainWindow;
};
