const { app, dialog, ipcMain, shell, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");

const fs = require("fs");
const path = require("path");
const url = require("url");
const isDev = require("electron-is-dev");
const chokidar = require("chokidar");
const Promise = require("bluebird");

const setMenu = require("./menu");

let mainWindow;

const startUrl = isDev
  ? "http://localhost:3000"
  : url.format({
      pathname: path.join(__dirname, "..", "build", "index.html"),
      protocol: "file:",
      slashes: true,
    });

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadURL(startUrl);
  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  setMenu(mainWindow);

  autoUpdater.checkForUpdatesAndNotify();
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// Opens a new browser window suitable for image/pdf capturing/printing
function captureWindow() {
  return new BrowserWindow({
    x: 0,
    y: 0,
    enableLargerThanScreen: true,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
}

function openDirectory() {
  return dialog
    .showOpenDialog(mainWindow, {
      title: "Select directory",
      properties: ["openDirectory", "createDirectory"],
    })
    .then(({ canceled, filePaths }) => {
      if (canceled) {
        return undefined;
      } else {
        return filePaths[0];
      }
    });
}

function alert(type, message) {
  mainWindow.webContents.send("alert", type, message);
}

function progress(progress, message) {
  mainWindow.webContents.send("progress", progress, message);
}

// Goes to path in the app, and saves a PDF to filePath
function createPDF(path, filePath) {
  return new Promise((resolve, reject) => {
    let win = captureWindow();

    win.webContents.on("did-stop-loading", () => {
      setTimeout(() => {
        win.webContents
          .printToPDF({
            marginsType: 0,
            scaleFactor: 100,
            printBackground: true,
          })
          .then((buffer) => {
            fs.writeFileSync(filePath, buffer);
            win.close();
            resolve(filePath);
          });
      }, 1000);
    });

    if (path.includes("?")) {
      path = `${path}&print=true`;
    } else {
      path = `${path}?print=true`;
    }
    win.loadURL(`${startUrl}#${path}`);
  });
}

ipcMain.on("pdf", (event, path) => {
  dialog
    .showSaveDialog(mainWindow, {
      title: "Save PDF",
      filters: [
        {
          name: "PDF Document",
          extensions: ["pdf"],
        },
      ],
    })
    .then(({ filePath, canceled }) => {
      if (canceled) {
        return false;
      }

      createPDF(path, filePath).then((filePath) => {
        shell.openPath(filePath);
        alert("success", `${filePath} saved`);
      });
    });
});

// Goes to path in the app, and saves a PNG to filePath of width x height
function createScreenshot(path, filePath) {
  return new Promise((resolve, reject) => {
    let win = captureWindow();

    win.webContents.on("will-redirect", () => {
      win.close();
      resolve();
    });

    win.webContents.on("did-stop-loading", () => {
      setTimeout(() => {
        win.webContents
          .executeJavaScript(
            'document.getElementsByClassName("printElement")[0].getBoundingClientRect().toJSON()'
          )
          .then(({ x, y, width, height }) => {
            win.setBounds({
              x: 0,
              y: 0,
              width: Math.ceil(width),
              height: Math.ceil(height),
            });
            return win.webContents.capturePage().then((image) => {
              let buffer = image.toPNG();
              fs.writeFileSync(filePath, buffer);
              win.close();
              resolve(filePath);
            });
          })
          .catch((err) => {
            // Game doesn't include this item
            win.close();
            resolve();
          });
      }, 1000);
    });

    if (path.includes("?")) {
      path = `${path}&print=true`;
    } else {
      path = `${path}?print=true`;
    }
    win.loadURL(`${startUrl}#${path}`);
  });
}

function getFilename(game, item, extension) {
  return `${game}-${item.replace(
    "?paginated=true",
    "-paginated"
  )}.${extension}`;
}

function getPath(game, item) {
  if (item.includes("?")) {
    return `/games/${game}/${item}&print=true`;
  } else {
    return `/games/${game}/${item}?print=true`;
  }
}

ipcMain.on("export-pdf", (event, game, items) => {
  return openDirectory().then((directory) => {
    if (directory) {
      let keys = Object.keys(items);
      let total = keys.length;
      let current = 0;
      return Promise.map(
        keys,
        (item) => {
          let basename = items[item];
          let filename = path.join(directory, basename);
          return createPDF(getPath(game, item), filename).then((exported) => {
            if (exported) {
              current = current + 1;
              let percent = Math.floor((current / total) * 100);
              progress(percent, `${current}/${total} - ${basename}`);
            }
          });
        },
        { concurrency: 4 }
      )
        .then(() => alert("success", `Exported ${game} to ${directory} as pdf`))
        .then(() => shell.openPath(directory))
        .catch(console.error.bind(console));
    }
  });
});

ipcMain.on("export-png", (event, game, items) => {
  return openDirectory().then((directory) => {
    if (directory) {
      let keys = Object.keys(items);
      let total = keys.length;
      let current = 0;
      return Promise.map(
        keys,
        (item) => {
          let basename = items[item];
          let filename = path.join(directory, basename);
          return createScreenshot(getPath(game, item), filename).then(
            (exported) => {
              if (exported) {
                current = current + 1;
                let percent = Math.floor((current / total) * 100);
                progress(percent, `${current}/${total} - ${basename}`);
              }
            }
          );
        },
        { concurrency: 8 }
      )
        .then(() => alert("success", `Exported ${game} to ${directory} as png`))
        .then(() => shell.openPath(directory))
        .catch(console.error.bind(console));
    }
  });
});

ipcMain.on("screenshot", (event, path) => {
  dialog
    .showSaveDialog(mainWindow, {
      title: "Save Screenshot",
      filters: [
        {
          name: "PNG Image",
          extensions: ["png"],
        },
      ],
    })
    .then(({ filePath, canceled }) => {
      if (canceled) {
        return false;
      }

      createScreenshot(path, filePath).then((filePath) => {
        shell.openPath(filePath);
        alert("success", `${filePath} saved`);
      });
    });
});

ipcMain.on("i18n", (event, filename) => {
  const file = `${app.getAppPath()}/${isDev ? "public" : "build"}/${filename}`;
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      event.returnValue = { err };
    } else {
      let result;

      try {
        result = JSON.parse(data);
      } catch (err) {
        event.returnValue = { err };
      }

      event.returnValue = { result };
    }
  });
});

// File watching when games are loaded
let watcher;
ipcMain.on("watch", (event, path, id, slug) => {
  if (path) {
    if (watcher) {
      watcher.close();
    }

    watcher = chokidar.watch(path);
    watcher.on("change", (path) => {
      let json = fs.readFileSync(path);

      try {
        let game = JSON.parse(json);
        game.id = id;
        game.slug = slug;
        mainWindow.webContents.send("watch", game);
      } catch (e) {
        console.error(e);
      }
    });
  } else {
    if (watcher) {
      watcher.close();
      watcher = null;
    }
  }
});
