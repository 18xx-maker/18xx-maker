import { join } from "node:path";

import { BrowserWindow } from "electron";

import { createWindowSlot } from "#export/window";
import { rootUrl } from "./window.js";

// The prefix of the preload argument that tells a capture window which export
// it belongs to, see preload.js
const RENDER_INPUT_ARG = "--render-input=";

let windows = 0;

// The export of every capture window that is open, by the id of its contents
const exports = new Map();

// The export a window of webContents belongs to, undefined for the others
export const exportOf = (webContents) => exports.get(webContents.id);

// A hidden window with the built renderer in render mode for an export, and
// the slot of the capture pool for it (see createWindowSlot). The window has a partition
// in memory of its own, so the stored games and config of the app are out of
// its reach, no node integration, and it can not go anywhere but the app.
export const openCaptureWindow = async (inputId) => {
  const window = new BrowserWindow({
    show: false,
    width: 1024,
    height: 768,
    webPreferences: {
      additionalArguments: [`${RENDER_INPUT_ARG}${inputId}`],
      // Hidden windows would stop painting, and the capture waits for it
      backgroundThrottling: false,
      // Painted off the screen, at one device pixel a CSS pixel like the
      // headless browser of the CLI, whatever the screen: a window on a retina
      // screen paints the page on its grid of half pixels before the capture
      // scales it to the dpi, so its images would not be the CLI's
      offscreen: true,
      nodeIntegration: false,
      partition: `export-${inputId}-${windows++}`,
      preload: join(import.meta.dirname, "../preload/preload.cjs"),
    },
  });
  const contentsId = window.webContents.id;
  exports.set(contentsId, inputId);
  window.once("closed", () => exports.delete(contentsId));

  return createWindowSlot(window, rootUrl);
};
