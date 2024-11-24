import fs from "node:fs";
import { join } from "node:path";

import Promise from "bluebird";
import { dialog, shell } from "electron";

import { send } from "./util.js";
import { captureWindow, getMainWindow, startUrl } from "./window.js";

const getPath = (game, item) => {
  if (item.includes("?")) {
    return `/games/${game}/${item}&print=true`;
  } else {
    return `/games/${game}/${item}?print=true`;
  }
};

const selectDirectory = (title = "Select directory") => {
  return dialog
    .showOpenDialog(getMainWindow(), {
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

// Goes to path in the app, and saves a PDF to filePath
const createPDF = (path, filePath) => {
  return new Promise((resolve) => {
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
};

export const pdf = (path) => {
  dialog
    .showSaveDialog(getMainWindow(), {
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
        send("alert", "PDF Created", filePath, "success");
      });
    });
};

// Goes to path in the app, and saves a PNG to filePath of width x height
const createScreenshot = (path, filePath) => {
  return new Promise((resolve) => {
    let win = captureWindow();

    win.webContents.on("will-redirect", () => {
      win.close();
      resolve();
    });

    win.webContents.on("did-stop-loading", () => {
      setTimeout(() => {
        win.webContents
          .executeJavaScript(
            'document.getElementsByClassName("printElement")[0].getBoundingClientRect().toJSON()',
          )
          .then(({ width, height }) => {
            win.setBounds({
              x: 0,
              y: 0,
              width: Math.ceil(width),
              height: Math.ceil(height),
            });
            return win.webContents
              .capturePage(
                {
                  x: 0,
                  y: 0,
                  width: Math.ceil(width),
                  height: Math.ceil(height),
                },
                {
                  stayHidden: true,
                },
              )
              .then((image) => {
                let buffer = image.toPNG();
                fs.writeFileSync(filePath, buffer);
                win.close();
                resolve(filePath);
              });
          })
          .catch(() => {
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
};

export const exportPDF = (game, items) => {
  return selectDirectory().then((directory) => {
    if (directory) {
      let keys = Object.keys(items);
      let total = keys.length;
      let current = 0;
      return Promise.map(
        keys,
        (item) => {
          let basename = items[item];
          let filename = join(directory, basename);
          return createPDF(getPath(game, item), filename).then((exported) => {
            if (exported) {
              current = current + 1;
              let percent = Math.floor((current / total) * 100);
              send(
                "progress",
                "Game Exporting",
                `${current}/${total} - ${basename}`,
                percent,
              );
            }
          });
        },
        { concurrency: 4 },
      )
        .then(() =>
          send(
            "alert",
            "Game Exported",
            `Exported ${game} to ${directory} as pdf files`,
            "success",
          ),
        )
        .then(() => shell.openPath(directory))
        .catch(console.error.bind(console));
    }
  });
};

export const exportPNG = (game, items) => {
  return selectDirectory().then((directory) => {
    if (directory) {
      let keys = Object.keys(items);
      let total = keys.length;
      let current = 0;
      return Promise.map(
        keys,
        (item) => {
          let basename = items[item];
          let filename = join(directory, basename);
          return createScreenshot(getPath(game, item), filename).then(
            (exported) => {
              if (exported) {
                current = current + 1;
                let percent = Math.floor((current / total) * 100);
                send(
                  "progress",
                  "Game Exporting",
                  `${current}/${total} - ${basename}`,
                  percent,
                );
              }
            },
          );
        },
        { concurrency: 8 },
      )
        .then(() =>
          send(
            "alert",
            "Game Exported",
            `Exported ${game} to ${directory} as png files`,
            "success",
          ),
        )
        .then(() => shell.openPath(directory))
        .catch(console.error.bind(console));
    }
  });
};

export const png = (path) => {
  dialog
    .showSaveDialog(getMainWindow(), {
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
        send("alert", "PNG Created", `${filePath} saved`, "success");
      });
    });
};
