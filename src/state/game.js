import { getI18n } from "react-i18next";

import { assoc, equals, omit } from "ramda";

import { games } from "@/data";
import { createAlert } from "@/state/alerts";
import { selectGameChanged } from "@/state/selectors";
import { parseSlug } from "@/util";
import { canSaveGame } from "@/util/canSaveGame";
import capability from "@/util/capability";
import { gameText } from "@/util/download";
import { BUNDLED, ELECTRON, getGameSummary } from "@/util/loading.js";
import { getRenderInput } from "@/util/renderInput";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";

export const SET_GAME = "SET_GAME";
export const DELETE_GAME = "DELETE_GAME";
export const EDIT_GAME = "EDIT_GAME";
export const GAME_SAVED = "GAME_SAVED";

// A game set with keepEdits only replaces the original: the edits stay, so a
// change of the file outside the app shows as edits against the new file
export const createSetGame = (game, { keepEdits = false } = {}) =>
  keepEdits ? { type: SET_GAME, game, keepEdits } : { type: SET_GAME, game };

// Replaces the game with an edited one, the original stays as it was loaded
export const createEditGame = (game) => ({ type: EDIT_GAME, game });

// The game was written to its file: the edited game is now the original and
// the content the file had before goes to the history
export const createGameSaved = (game, previous, savedAt = Date.now()) => ({
  type: GAME_SAVED,
  game,
  previous,
  savedAt,
});

// For editors: the edited game is the result of the function on the game
export const editGame = (fn) => (dispatch, getState) => {
  const { game } = getState();
  if (game) dispatch(createEditGame(fn(game)));
};

export const revertGame = () => (dispatch, getState) => {
  const { gameOriginal } = getState();
  if (gameOriginal) dispatch(createEditGame(gameOriginal));
};

// Puts a game of the history back as the edited game
export const restoreGame = (index) => (dispatch, getState) => {
  const entry = getState().gameHistory[index];
  if (entry) dispatch(createEditGame(entry.game));
};

export const createDeleteGame = (slug) => {
  const { type, id } = parseSlug(slug);

  return {
    type: DELETE_GAME,
    meta: { id, slug, type },
  };
};

export const refreshGame = () => (dispatch, getState) => {
  const { loadedGame } = getState();

  if (loadedGame && loadedGame.type === "system") {
    return idb
      .loadGame(loadedGame.id)
      .then((game) => {
        dispatch(createSetGame(game));
        dispatch(
          createAlert(
            "Game Refreshed",
            `${loadedGame.id} refreshed from file system`,
            "success",
          ),
        );
        return game;
      })
      .catch((e) => {
        dispatch(createAlert(e.name, e.message, "error"));
        throw e;
      });
  }
};

// A quiet load restores the game of the last session in the background: no
// alerts, and it never replaces a game that was opened in the meantime.
export const loadGame =
  (slug, quiet = false) =>
  (dispatch, getState) => {
    const { type, id } = parseSlug(slug);

    const render = getRenderInput();

    return new Promise((resolve, reject) => {
      // The game of render mode is the one that was given, never loaded
      if (render && slug === render.game.meta.slug) {
        return resolve(render.game);
      }

      if (type === BUNDLED) {
        if (!games[id]) {
          return reject(new Error(`Bundled game ${id} not found`));
        }

        return resolve(games[id]);
      }

      if (type === idb.TYPE) {
        if (!capability.system) {
          return reject(
            new Error(
              "Your browser doesn't support loading games from your file system",
            ),
          );
        }

        return resolve(idb.loadGame(id));
      }

      if (type === opfs.TYPE) {
        if (!capability.internal) {
          return reject(
            new Error(
              "Your browser doesn't support loading games from the private internal file system",
            ),
          );
        }

        return resolve(opfs.loadGame(id));
      }

      if (type === ELECTRON) {
        if (!capability.electron) {
          return reject(
            new Error(
              "Your browser doesn't support loading games from the file system",
            ),
          );
        }

        return resolve(window.api.loadGame(id));
      }
      return reject(new Error(`Unknown game type ${type}`));
    })
      .then((game) => {
        if (quiet) {
          if (!getState().game) dispatch(createSetGame(game));
          return game;
        }

        // Loading must not throw away the edits of the game that is open
        const open = getState().game;
        if (open?.meta.slug === slug && selectGameChanged(getState())) {
          return open;
        }

        const typeLabel = type[0].toUpperCase() + type.slice(1);
        dispatch(createSetGame(game));
        dispatch(
          createAlert(
            "Game Loaded",
            `${typeLabel} game ${game.info.title} loaded`,
            "success",
          ),
        );
        return game;
      })
      .catch((e) => {
        if (!quiet) dispatch(createAlert(e.name, e.message, "error"));
        throw e;
      });
  };

export const deleteGame = (slug, title) => (dispatch) => {
  const { type, id } = parseSlug(slug);

  return new Promise((resolve, reject) => {
    if (type === BUNDLED) {
      return reject(new Error(`Cannot forget bundled game: ${title}`));
    }

    if (type === idb.TYPE) {
      if (!capability.system) {
        return reject(
          new Error(
            "Your browser doesn't support deleting games from your file system",
          ),
        );
      }

      return resolve(idb.deleteGame(id));
    }

    if (type === opfs.TYPE) {
      if (!capability.internal) {
        return reject(
          new Error(
            "Your browser doesn't support deleting games from the private internal file system",
          ),
        );
      }

      return resolve(opfs.deleteGame(id));
    }

    if (type === ELECTRON) {
      if (!capability.electron) {
        return reject(
          new Error(
            "Your browser doesn't support deleting games from the file system",
          ),
        );
      }

      return resolve(window.api.deleteGame(id));
    }

    return reject(new Error(`Unknown game type ${type}`));
  })
    .then(() => {
      const typeLabel = type[0].toUpperCase() + type.slice(1);
      dispatch(createDeleteGame(slug));
      dispatch(
        createAlert(
          "Game Forgotten",
          `${typeLabel} game ${title} forgotten`,
          "success",
        ),
      );
      return slug;
    })
    .catch((e) => {
      dispatch(createAlert(e.name, e.message, "error"));
      throw e;
    });
};

// Games are the same file when they only differ in their meta
export const sameFile = (a, b) => equals(omit(["meta"], a), omit(["meta"], b));

const t = (key, vars) => getI18n().t(key, vars);

const readGame = (type, id) =>
  type === idb.TYPE
    ? idb.loadGame(id)
    : type === opfs.TYPE
      ? opfs.loadGame(id)
      : window.api.loadGame(id);

// Replaces the game, edits included, with what is in its file
export const reloadGame = () => (dispatch, getState) => {
  const { game } = getState();
  if (!game || !canSaveGame(game.meta.type)) return Promise.resolve();

  return readGame(game.meta.type, game.meta.id)
    .then((loaded) => {
      dispatch(createSetGame(loaded));
      dispatch(
        createAlert(
          t("alerts.gameLoaded"),
          t("alerts.gameLoadedMessage", { title: loaded.info.title }),
          "success",
        ),
      );
      return loaded;
    })
    .catch((e) => {
      dispatch(createAlert(e.name, e.message, "error"));
    });
};

// A file that came from outside the app (the Electron file watcher). The echo
// of our own save is the original and changes nothing; a change of the file
// while there are unsaved edits keeps them.
export const receiveGame = (game) => (dispatch, getState) => {
  const { game: open, gameOriginal } = getState();
  const same = open?.meta.slug === game.meta.slug;

  if (same && gameOriginal && sameFile(game, gameOriginal)) return;

  dispatch(
    createSetGame(game, { keepEdits: same && selectGameChanged(getState()) }),
  );
  dispatch(
    createAlert(
      t("alerts.gameLoaded"),
      t("alerts.gameLoadedMessage", { title: game.info.title }),
      "success",
    ),
  );
};

export const SAVED = "saved";
export const CONFLICT = "conflict";
export const FAILED = "failed";

// Writes the edited game over its file, as the download writes it. The file is
// read first: when it is not the original any more (changed outside the app)
// nothing is written and the result is "conflict", unless force is set.
// Resolves to "saved", "conflict" or "failed" (with an alert).
export const saveGame =
  ({ force = false } = {}) =>
  async (dispatch, getState) => {
    const { game, gameOriginal } = getState();
    if (!game || !gameOriginal || !canSaveGame(game.meta.type)) return FAILED;
    const { type, id } = game.meta;

    try {
      // Permission needs the click that saved, so it is asked first
      if (type === idb.TYPE) await idb.requestWrite(id);

      let previous = gameOriginal;
      if (type === ELECTRON) {
        const result = await window.api.saveGame(
          id,
          gameText(game),
          force ? null : omit(["meta"], gameOriginal),
        );
        if (result.conflict) return CONFLICT;
        if (result.previous)
          previous = assoc("meta", game.meta, result.previous);
      } else {
        const store =
          type === idb.TYPE
            ? { peek: idb.peekGame, write: idb.writeGame }
            : { peek: opfs.peekGame, write: opfs.overwriteGame };
        const file = await store.peek(id);
        if (!force && !sameFile(file, gameOriginal)) return CONFLICT;
        previous = file;
        await store.write(id, gameText(game));
      }

      dispatch(createGameSaved(game, previous));
      dispatch(
        createAlert(
          t("changes.saved"),
          t("changes.savedMessage", { title: game.info.title }),
          "success",
        ),
      );
      return SAVED;
    } catch (e) {
      dispatch(createAlert(t("changes.saveFailed"), e.message, "error"));
      return FAILED;
    }
  };

export const gameReducer = (state = undefined, action) => {
  switch (action.type) {
    case SET_GAME:
      if (action.keepEdits && state) {
        return state;
      }
      return action.game ? { ...action.game } : undefined;
    case EDIT_GAME:
      return state && action.game
        ? { ...action.game, meta: state.meta }
        : state;
    case DELETE_GAME:
      if (state && state.meta.id === action.meta.id) {
        return undefined;
      }
      return state;
    default:
      return state;
  }
};

// The game as it is in its file: loaded or saved last
export const gameOriginalReducer = (state = undefined, action) => {
  switch (action.type) {
    case SET_GAME:
      return action.game ? { ...action.game } : undefined;
    case GAME_SAVED:
      return { ...action.game };
    case DELETE_GAME:
      return state && state.meta.id === action.meta.id ? undefined : state;
    default:
      return state;
  }
};

// What the saves replaced in this session, newest first: { savedAt, game }
export const gameHistoryReducer = (state = [], action) => {
  switch (action.type) {
    case SET_GAME:
      return action.game && state[0]?.game.meta.slug === action.game.meta.slug
        ? state
        : [];
    case GAME_SAVED:
      return [{ savedAt: action.savedAt, game: action.previous }, ...state];
    case DELETE_GAME:
      return state[0]?.game.meta.id === action.meta.id ? [] : state;
    default:
      return state;
  }
};

export const loadedGameReducer = (state = undefined, action) => {
  if (action.type === SET_GAME) {
    if (!action.game) {
      return undefined;
    }

    return getGameSummary(action.game);
  }

  if (action.type === GAME_SAVED) {
    return getGameSummary(action.game);
  }

  if (action.type === DELETE_GAME) {
    if (state && state.id === action.meta.id) {
      return undefined;
    }
  }

  return state;
};
