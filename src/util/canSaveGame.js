import capability from "@/util/capability";
import { getRenderInput } from "@/util/renderInput";

// Whether a game of this type can be written back to its file: bundled games
// and the games of render mode (a capture window has no saveGame) cannot
export const canSaveGame = (type) =>
  (type === "internal" && capability.internal) ||
  (type === "system" && capability.system) ||
  (type === "electron" &&
    capability.electron &&
    typeof window.api?.saveGame === "function");

// Whether images dropped onto the app can be added to a game of this type:
// the folder next to the game file in the app (when the main process can write
// it), the browser storage of the games the web app keeps. Bundled games and
// render mode cannot.
export const canAddAssets = (type) =>
  !getRenderInput() &&
  ((type === "internal" && capability.internal && capability.apis.idb) ||
    (type === "system" && capability.system && capability.apis.idb) ||
    (type === "electron" &&
      capability.electron &&
      typeof window.api?.addAsset === "function"));

// Where a bundled game is saved as a new file: "electron" (its save dialog),
// "picker" (the browser's save file picker) or "internal" (the private file
// system), in that order. Undefined when it cannot be, and for every game
// that has a file of its own.
export const saveAsBackend = (type) => {
  if (type !== "bundled" || getRenderInput()) return undefined;
  if (capability.electron && typeof window.api?.saveGameAs === "function")
    return "electron";
  if (capability.system && capability.apis.save_file_picker) return "picker";
  if (capability.internal) return "internal";
  return undefined;
};

export const canSaveGameAs = (type) => saveAsBackend(type) !== undefined;
