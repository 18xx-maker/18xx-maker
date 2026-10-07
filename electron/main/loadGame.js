// The loadGame channel. The page names a game by id; what went wrong is told
// by a code in the message (see the preload), which the page shows translated:
//   missing    the file is gone, the game is forgotten
//   invalid    the file is not JSON
//   unreadable anything else (a lock, no permission), the game is kept
export const GAME_LOAD_PREFIX = "game-load:";

export const loadErrorCode = (e) =>
  e?.code === "ENOENT"
    ? "missing"
    : e instanceof SyntaxError
      ? "invalid"
      : "unreadable";

export const createLoadGame =
  ({ summaryOf, loadGame, watch, stopWatching, deleteGame }) =>
  async (event, id) => {
    if (typeof id !== "string" || !summaryOf(id)) {
      throw new Error(`Electron game ${id} not found`);
    }

    // Watched before the load: a file that is not valid yet is watched too, so
    // fixing it shows up
    watch(id);
    try {
      return await loadGame(id);
    } catch (e) {
      const code = loadErrorCode(e);
      // Only a file that is gone is forgotten: a game that is locked or not
      // valid yet stays in the library, where it can be forgotten by hand
      if (code === "missing") {
        stopWatching(id);
        deleteGame(id);
      }
      throw new Error(`${GAME_LOAD_PREFIX}${code}`, { cause: e });
    }
  };
