import { app } from "electron";

export const isDev =
  Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1 || !app.isPackaged;
