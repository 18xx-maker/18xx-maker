const { contextBridge, shell, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("isElectron", true);
contextBridge.exposeInMainWorld("openExternal", (url) =>
  shell.openExternal(url)
);
contextBridge.exposeInMainWorld("ipc", {
  addListeners: (alert, progress, redirect) => {
    ipcRenderer.on("alert", alert);
    ipcRenderer.on("progress", progress);
    ipcRenderer.on("redirect", redirect);
  },
  removeListeners: (alert, progress, redirect) => {
    ipcRenderer.removeListener("alert", alert);
    ipcRenderer.removeListener("progress", progress);
    ipcRenderer.removeListener("redirect", redirect);
  },
  addGameListener: (update) => ipcRenderer.on("watch", update),
  removeGameListener: (update) => ipcRenderer.removeListener("watch", update),
  watchGame: (path, id, slug) => ipcRenderer.send("watch", path, id, slug),
  removeWatch: () => ipcRenderer.send("watch"),
  readI18n: (filename) => ipcRenderer.sendSync("i18n", filename),
  exportPDF: (slug, items) => ipcRenderer.send("export-pdf", slug, items),
  exportPNG: (slug, items) => ipcRenderer.send("export-png", slug, items),
  pdf: (path) => ipcRenderer.send("pdf", path),
  png: (path) => ipcRenderer.send("png", path),
});
