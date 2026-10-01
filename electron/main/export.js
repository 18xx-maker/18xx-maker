import fs from "node:fs";
import { join } from "node:path";

import Promise from "bluebird";
import { dialog, shell } from "electron";

import { send } from "./util.js";
import { captureWindow, getMainWindow, startBaseUrl } from "./window.js";

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

const waitForPrintElement = async (win, timeout = 15000) => {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const bounds = await win.webContents.executeJavaScript(`
      (() => {
        const element = document.querySelector(".printElement");
        if (!element) return null;

        const bounds = element.getBoundingClientRect();
        if (bounds.width <= 0 || bounds.height <= 0) return null;

        return bounds.toJSON();
      })()
    `);

    if (bounds) {
      return bounds;
    }

    await Promise.delay(100);
  }

  throw new Error(`Timed out waiting for printable content`);
};

// Goes to path in the app, and saves a PDF to filePath
const createPDF = (path, filePath) => {
  return new Promise((resolve) => {
    let win = captureWindow();

    win.webContents.on("did-stop-loading", () => {
      setTimeout(() => {
        win.webContents
          .printToPDF({
            printBackground: true,
            displayHeaderFooter: false,
            scale: 1,
            preferCSSPageSize: true,
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
    win.loadURL(`${startBaseUrl}#${path}`);
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
  return new Promise((resolve, reject) => {
    let win = captureWindow();

    win.webContents.once("will-redirect", (_event, url) => {
      win.close();
      reject(new Error(`Export page redirected to ${url}`));
    });

    win.webContents.once("did-finish-load", async () => {
      try {
        const { width, height } = await waitForPrintElement(win);
        win.setContentSize(Math.ceil(width), Math.ceil(height), false);

        const image = await win.webContents.capturePage(
          {
            x: 0,
            y: 0,
            width: Math.ceil(width),
            height: Math.ceil(height),
          },
          {
            stayHidden: true,
          },
        );
        fs.writeFileSync(filePath, image.toPNG());
        win.close();
        resolve(filePath);
      } catch (error) {
        if (!win.isDestroyed()) {
          win.close();
        }
        reject(error);
      }
    });

    win.webContents.once(
      "did-fail-load",
      (_event, errorCode, errorDescription) => {
        if (!win.isDestroyed()) {
          win.close();
        }
        reject(new Error(`${errorDescription} (${errorCode})`));
      },
    );

    if (path.includes("?")) {
      path = `${path}&print=true`;
    } else {
      path = `${path}?print=true`;
    }
    win.loadURL(`${startBaseUrl}#${path}`).catch((error) => {
      if (!win.isDestroyed()) {
        win.close();
      }
      reject(error);
    });
  });
};

const exportScreenshot = (path, filePath) =>
  createScreenshot(path, filePath).catch((error) => ({
    error,
    filePath,
  }));

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
          return exportScreenshot(getPath(game, item), filename).then(
            (exported) => {
              if (typeof exported === "string") {
                current = current + 1;
                let percent = Math.floor((current / total) * 100);
                send(
                  "progress",
                  "Game Exporting",
                  `${current}/${total} - ${basename}`,
                  percent,
                );
              }
              return exported;
            },
          );
        },
        { concurrency: 8 },
      )
        .then((results) => {
          const failures = results.filter(({ error } = {}) => error);

          if (failures.length) {
            send(
              "alert",
              "Game Export Incomplete",
              `${failures.length} of ${total} PNG files could not be exported`,
              "error",
            );
            failures.forEach(({ error, filePath }) =>
              console.error(`Failed to export ${filePath}:`, error),
            );
          } else {
            send(
              "alert",
              "Game Exported",
              `Exported ${game} to ${directory} as png files`,
              "success",
            );
          }
        })
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

      createScreenshot(path, filePath)
        .then((filePath) => {
          shell.openPath(filePath);
          send("alert", "PNG Created", filePath, "success");
        })
        .catch((error) => {
          console.error(`Failed to export ${path}:`, error);
          send(
            "alert",
            "PNG Export Failed",
            "This page could not be exported as a PNG",
            "error",
          );
        });
    });
};
