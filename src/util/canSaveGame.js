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
