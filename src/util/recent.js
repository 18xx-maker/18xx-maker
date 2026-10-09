import capability from "@/util/capability";
import { getRenderInput } from "@/util/renderInput";

// Adds an opened game to the recent games of the app's menu. Passes the game
// through, so it can sit in a promise chain.
export const addRecent = (game) => {
  // The capture windows of an export are not games the user opened
  if (game && capability.electron && !getRenderInput()) {
    window.api.addRecent(game.info.title, game.meta.slug);
  }
  return game;
};
