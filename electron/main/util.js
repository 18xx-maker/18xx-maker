import { getMainWindow } from "./window.js";

export const send = (...args) => {
  const window = getMainWindow();

  if (window) {
    window.webContents.send(...args);
  }
};
