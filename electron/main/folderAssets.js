import { createFolderAssets } from "./assets.js";
import { getSummary } from "./config.js";

export const folderAssets = createFolderAssets({ summaryOf: getSummary });
