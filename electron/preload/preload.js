const { contextBridge, ipcRenderer } = require("electron/renderer");
const { webUtils } = require("electron");

ipcRenderer.setMaxListeners(50);

const api = {
  // PDF/PNG Exporting
  exportPDF: (game, items) => ipcRenderer.send("exportPDF", game, items),
  exportPNG: (game, items) => ipcRenderer.send("exportPNG", game, items),
  pdf: (path) => ipcRenderer.send("pdf", path),
  png: (path) => ipcRenderer.send("png", path),

  saveGamePath: (file) =>
    ipcRenderer
      .invoke("saveGamePath", webUtils.getPathForFile(file))
      .catch((e) => {
        console.error(e);
        throw new Error("File was not a valid 18xx-maker game");
      }),
  loadGame: (id) =>
    ipcRenderer.invoke("loadGame", id).catch((e) => {
      console.error(e);
      throw new Error(
        `Electron game ${id} not found or was not a valid 18xx-maker game`,
      );
    }),
  loadSummaries: () => ipcRenderer.invoke("loadSummaries"),
  openGame: () =>
    ipcRenderer.invoke("openGame").catch((e) => {
      console.error(e);
      throw new Error("File was not a valid 18xx-maker game");
    }),

  addRecent: (title, slug) => ipcRenderer.send("addRecent", title, slug),
  deleteGame: (id) => ipcRenderer.send("deleteGame", id),

  // Alerts and Redirects
  onAlert: (callback) =>
    ipcRenderer.on("alert", (_event, title, message, type) =>
      callback(title, message, type),
    ),
  onProgress: (callback) =>
    ipcRenderer.on("progress", (_event, title, message, progress) =>
      callback(title, message, progress),
    ),
  onRedirect: (callback) =>
    ipcRenderer.on("redirect", (_event, path) => callback(path)),

  onGame: (callback) =>
    ipcRenderer.on("game", (_event, game) => callback(game)),

  off: () => ipcRenderer.removeAllListeners(),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.api = api;
}
