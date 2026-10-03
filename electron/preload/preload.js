import { contextBridge, ipcRenderer, webUtils } from "electron/renderer";

import { createApi } from "./api.js";

contextBridge.exposeInMainWorld(
  "api",
  createApi({ ipcRenderer, webUtils, argv: process.argv }),
);
