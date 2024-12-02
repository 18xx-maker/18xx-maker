import { games } from "@/data";
import { createAlert } from "@/state/alerts";
import { parseSlug } from "@/util";
import capability from "@/util/capability";
import * as idb from "@/util/idb";
import { BUNDLED, ELECTRON, getGameSummary } from "@/util/loading.js";
import * as opfs from "@/util/opfs";

export const SET_GAME = "SET_GAME";
export const DELETE_GAME = "DELETE_GAME";

export const createSetGame = (game) => ({
  type: SET_GAME,
  game,
});

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

export const loadGame = (slug) => (dispatch) => {
  const { type, id } = parseSlug(slug);

  return new Promise((resolve, reject) => {
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
      dispatch(createAlert(e.name, e.message, "error"));
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
            "Your browser doesn't support loading games from your file system",
          ),
        );
      }

      return resolve(idb.deleteGame(id));
    }

    if (type === opfs.TYPE) {
      if (!capability.internal) {
        return reject(
          new Error(
            "Your browser doesn't support loading games from the private internal file system",
          ),
        );
      }

      return resolve(opfs.deleteGame(id));
    }

    if (type === ELECTRON) {
      if (!capability.electron) {
        return reject(
          new Error(
            "Your browser doesn't support loading games from the file system",
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

export const gameReducer = (state = undefined, action) => {
  switch (action.type) {
    case SET_GAME:
      return action.game ? { ...action.game } : undefined;
    case DELETE_GAME:
      if (state && state.meta.id === action.meta.id) {
        return undefined;
      }
      return state;
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

  if (action.type === DELETE_GAME) {
    if (state && state.id === action.meta.id) {
      return undefined;
    }
  }

  return state;
};
