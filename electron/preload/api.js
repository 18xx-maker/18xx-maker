const RENDER_INPUT_ARG = "--render-input=";

// What the page gets as window.api. The window of an export capture (it has
// its export in its arguments, see electron/main/capture.js) is only given the
// game and config it shows (see util/renderInput), none of the app's calls.
export const createApi = ({ ipcRenderer, webUtils, argv }) => {
  const renderInputId = argv
    .find((arg) => arg.startsWith(RENDER_INPUT_ARG))
    ?.slice(RENDER_INPUT_ARG.length);

  if (renderInputId !== undefined) {
    return {
      renderInput: ipcRenderer.sendSync("getRenderInput", renderInputId),
    };
  }

  return {
    // Exporting pdf, png and Board18 files: one request, answered when the
    // export is over. Progress and the result come as alerts.
    export: (request) => ipcRenderer.invoke("export", request),
    cancelExport: () => ipcRenderer.invoke("export:cancel"),
    chooseExportFolder: () => ipcRenderer.invoke("export:folder"),

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
    // Writes the game text over the game's file. `expected` is the game as it
    // was loaded: a file that changed since is not overwritten (conflict).
    saveGame: (id, text, expected) =>
      ipcRenderer.invoke("saveGame", id, text, expected),
    loadSummaries: () => ipcRenderer.invoke("loadSummaries"),
    openGame: () =>
      ipcRenderer
        .invoke("openGame")
        .catch((e) => {
          console.error(e);
          throw new Error("File was not a valid 18xx-maker game");
        })
        .then((slug) => {
          if (slug === "undefined") {
            return;
          }
          return slug;
        }),
    loadConfig: () => ipcRenderer.invoke("loadConfig"),
    loadPlatformAndVersions: () =>
      ipcRenderer.sendSync("loadPlatformAndVersions"),

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

    onUpdate: (callback) =>
      ipcRenderer.on("update", (_event, update) => callback(update)),
    onDownloadProgress: (callback) =>
      ipcRenderer.on("downloadProgress", (_event, percent) =>
        callback(percent),
      ),

    downloadUpdate: () => ipcRenderer.send("downloadUpdate"),
    checkForUpdates: () => ipcRenderer.send("checkForUpdates"),

    off: () => ipcRenderer.removeAllListeners(),
  };
};
