import { configureStore } from "@reduxjs/toolkit";
import { mapObjIndexed, mergeDeepRight } from "ramda";

import { combineReducers } from "@/state/helpers";
import { games } from "@/data";
import { getGameSummary } from "@/util/loading.js";

import { ALERT_DEFAULT, alertReducer } from "@/state/alerts";
import { configReducer } from "@/state/config";
import { gameReducer, loadedGameReducer } from "@/state/game";
import { summariesReducer } from "@/state/summaries";
import storage from "@/state/storage";

const summaries = { bundled: mapObjIndexed(getGameSummary, games) };

// Pick which top level fields we want to keep in local storage
storage.init("config", "loadedGame");

export const rootReducer = combineReducers({
  alert: alertReducer,
  loadedGame: loadedGameReducer,
  summaries: summariesReducer,
  config: configReducer,
  game: gameReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: mergeDeepRight(
    { alert: ALERT_DEFAULT, summaries, config: {} },
    storage.initialState(),
  ),
});

storage.listen(store);
