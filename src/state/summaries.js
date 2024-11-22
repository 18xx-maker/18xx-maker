import { assocPath, zipObj } from "ramda";

import { SET_GAME } from "@/state/game";
import capability from "@/util/capability";
import * as idb from "@/util/idb";
import { getGameSummary } from "@/util/loading.js";
import * as opfs from "@/util/opfs";

export const SET_SUMMARIES = "SET_SUMMARIES";

export const createSetSummaries = (summaries) => ({
  type: SET_SUMMARIES,
  summaries,
});

export const loadSummaries = () => (dispatch) => {
  if (capability.electron) {
    return window.api.loadSummaries().then(createSetSummaries).then(dispatch);
  }

  Promise.all([
    capability.internal ? opfs.loadSummaries() : undefined,
    capability.system ? idb.loadSummaries() : undefined,
  ])
    .then(zipObj(["internal", "system"]))
    .then(createSetSummaries)
    .then(dispatch);
};

export const summariesReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_SUMMARIES:
      return { ...state, ...action.summaries };
    case SET_GAME:
      return assocPath(
        [action.game.meta.type, action.game.meta.slug],
        getGameSummary(action.game),
        state,
      );
    default:
      return state;
  }
};
