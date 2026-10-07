import path from "node:path";

// Wrappers for the IPC channels of the app. Only the main window may use them:
// a capture window, or a page that navigated somewhere else, gets nothing.
// The arguments of the handler are not changed, the event stays the first one.
//
// isMain(event) says if an IPC event comes from the app's main window

// ipcMain.handle: a rejected caller gets an error
export const guardHandle =
  (isMain, handler) =>
  (event, ...args) => {
    if (!isMain(event)) throw new Error("This is not available here");
    return handler(event, ...args);
  };

// ipcMain.on: a rejected caller is ignored
export const guardOn =
  (isMain, handler) =>
  (event, ...args) => {
    if (!isMain(event)) return undefined;
    return handler(event, ...args);
  };

// ipcRenderer.sendSync: a rejected caller gets null
export const guardSync =
  (isMain, handler) =>
  (event, ...args) => {
    if (!isMain(event)) {
      event.returnValue = null;
      return undefined;
    }
    return handler(event, ...args);
  };

// The path of a game file the page sends (the path of a dropped file): an
// absolute path. The file is not named .json for sure: a game dropped from the
// file system may have any name, its content is what is checked.
export const assertGamePath = (file) => {
  if (typeof file !== "string" || !path.isAbsolute(file)) {
    throw new Error("Invalid game file");
  }
  return file;
};
