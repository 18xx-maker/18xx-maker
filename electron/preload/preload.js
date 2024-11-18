const { contextBridge, ipcRenderer } = require("electron/renderer");
const { webUtils } = require("electron");

ipcRenderer.setMaxListeners(25);

const api = {
  pdf: (path) => ipcRenderer.send("pdf", path),
  export_pdf: (game, items) => ipcRenderer.send("export-pdf", game, items),
  export_png: (game, items) => ipcRenderer.send("export-png", game, items),
  screenshot: (path) => ipcRenderer.send("screenshot", path),
  watch: (file, id, slug) =>
    ipcRenderer.send(
      "watch",
      file ? webUtils.getPathForFile(file) : undefined,
      id,
      slug,
    ),

  onAlert: (callback) =>
    ipcRenderer.on("alert", (_event, type, message) => callback(type, message)),
  onProgress: (callback) =>
    ipcRenderer.on("progress", (_event, progress, message) =>
      callback(progress, message),
    ),
  onRedirect: (callback) =>
    ipcRenderer.on("redirect", (_event, path) => callback(path)),

  offAlert: (callback) => ipcRenderer.removeListener("alert", callback),
  offProgress: (callback) => ipcRenderer.removeListener("progress", callback),
  offRedirect: (callback) => ipcRenderer.removeListener("redirect", callback),

  onWatch: (callback) =>
    ipcRenderer.on("watch", (_event, game) => callback(game)),
  offWatch: (callback) => ipcRenderer.removeListener("watch", callback),
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
