import capability from "@/util/capability";

// Whether a game of this type can be written back to its file: bundled games
// and the games of render mode (a capture window has no saveGame) cannot
export const canSaveGame = (type) =>
  (type === "internal" && capability.internal) ||
  (type === "system" && capability.system) ||
  (type === "electron" &&
    capability.electron &&
    typeof window.api?.saveGame === "function");
