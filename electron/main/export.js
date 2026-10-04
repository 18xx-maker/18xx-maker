import { randomUUID } from "node:crypto";
import os from "node:os";
import { basename, dirname, join } from "node:path";

import { app, dialog, ipcMain, shell } from "electron";

import { createExportIpc, fromMainWindow } from "#export/ipc";
import { createPool } from "#export/pool";
import { createExportService } from "#export/service";
import { createFileSink } from "#export/sink";
import { writeZip } from "#export/zip";
import { exportOf, openCaptureWindow } from "./capture.js";
import { getMainWindow, startBaseUrl } from "./window.js";

// How many capture windows are open at once, and how many files a window
// captures before it is replaced
const WINDOWS = Math.max(1, Math.min(3, os.cpus().length - 1));
const RECYCLE_AFTER = 25;

// The game and config of every export that is running, for its capture
// windows to ask for (see the preload)
const inputs = new Map();

const openPool = (input) => {
  const id = randomUUID();
  inputs.set(id, input);
  const pool = createPool({
    open: () => openCaptureWindow(id),
    size: WINDOWS,
    recycleAfter: RECYCLE_AFTER,
  });

  return {
    ...pool,
    close: async () => {
      await pool.close();
      inputs.delete(id);
    },
  };
};

const SAVE_FILTERS = {
  pdf: { name: "PDF Document", extensions: ["pdf"] },
  png: { name: "PNG Image", extensions: ["png"] },
  svg: { name: "SVG Image", extensions: ["svg"] },
};

const dialogs = {
  saveFile: async ({ title, name, format }) => {
    const { filePath, canceled } = await dialog.showSaveDialog(
      getMainWindow(),
      {
        title,
        defaultPath: name,
        filters: [SAVE_FILTERS[format] || SAVE_FILTERS.png],
      },
    );
    return canceled || !filePath
      ? undefined
      : { out: dirname(filePath), name: basename(filePath) };
  },

  chooseFolder: async (title = "Select directory") => {
    const { canceled, filePaths } = await dialog.showOpenDialog(
      getMainWindow(),
      { title, properties: ["openDirectory", "createDirectory"] },
    );
    return canceled ? undefined : filePaths[0];
  },
};

const service = createExportService({
  dialogs,
  openPool,
  createSink: createFileSink,
  zip: writeZip,
  show: (out, relPath) => shell.showItemInFolder(join(out, relPath)),
  concurrency: WINDOWS,
});

// Progress and results go to the window that asked for the export
const channel = (sender) => {
  const send = (...args) => {
    if (!sender.isDestroyed()) sender.send(...args);
  };
  return {
    progress: (title, message, percent) =>
      send("progress", title, message, percent),
    alert: (title, message, type) => send("alert", title, message, type),
  };
};

export const cancelExports = () => service.cancelAll();

export const registerExport = () => {
  const ipc = createExportIpc({
    isMain: (event) => fromMainWindow(event, getMainWindow(), startBaseUrl),
    service,
    chooseFolder: () => dialogs.chooseFolder(),
    channel,
  });
  ipcMain.handle("export", (event, request) => ipc.export(event, request));
  ipcMain.handle("export:cancel", (event) => ipc.cancel(event));
  ipcMain.handle("export:folder", (event) => ipc.folder(event));

  // Only a capture window gets the input of its own export
  ipcMain.on("getRenderInput", (event, id) => {
    event.returnValue =
      exportOf(event.sender) === id ? (inputs.get(id) ?? null) : null;
  });

  // The windows of an export must not keep the app alive when its window is
  // closed (the app quits when the last window closes on Windows and Linux)
  app.on("before-quit", cancelExports);
  app.on("browser-window-created", (_event, window) =>
    window.on("close", () => {
      if (window === getMainWindow()) cancelExports();
    }),
  );
};
