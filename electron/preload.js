const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  pdf: (path) => ipcRenderer.send("pdf", path),
  export_pdf: (game, items) => ipcRenderer.send("export-pdf", game, items),
  export_png: (game, items) => ipcRenderer.send("export-png", game, items),
  screenshot: (path) => ipcRenderer.send("screenshot", path),
  watch: (path, id, slug) => ipcRenderer.send("watch", path, id, slug),

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
});
