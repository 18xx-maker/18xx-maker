import { assocPath, dissocPath } from "ramda";

import { DELETE_GAME, SET_GAME } from "@/state/game";
import capability from "@/util/capability";
import { getGameSummary } from "@/util/loading.js";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";

export const SET_SUMMARIES = "SET_SUMMARIES";

export const createSetSummaries = (summaries) => ({
  type: SET_SUMMARIES,
  summaries,
});

const logged = new Set();

// One store failing must not hide the other, and the games already in state
// stay: a failed store is left out of the update.
const settle = (key, load) =>
  Promise.resolve()
    .then(load)
    .then((summaries) => ({ [key]: summaries }))
    .catch((e) => {
      if (!logged.has(key)) {
        logged.add(key);
        console.error(`Could not load the ${key} games`, e);
      }
      return {};
    });

export const loadSummaries = () => (dispatch) => {
  if (capability.electron) {
    return window.api.loadSummaries().then(createSetSummaries).then(dispatch);
  }

  return Promise.all([
    capability.internal
      ? settle("internal", opfs.loadSummaries)
      : { internal: undefined },
    capability.system
      ? settle("system", idb.loadSummaries)
      : { system: undefined },
  ])
    .then((parts) => Object.assign({}, ...parts))
    .then(createSetSummaries)
    .then(dispatch);
};

export const summariesReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_SUMMARIES:
      return { ...state, ...action.summaries };
    case SET_GAME:
      if (!action.game) {
        return state;
      }

      return assocPath(
        [action.game.meta.type, action.game.meta.slug],
        getGameSummary(action.game),
        state,
      );
    case DELETE_GAME:
      return dissocPath([action.meta.type, action.meta.slug], state);
    default:
      return state;
  }
};
