import { configureStore } from "@reduxjs/toolkit";

import { mapObjIndexed, mergeDeepRight } from "ramda";

import { games } from "@/data";
import { ALERT_DEFAULT, alertReducer } from "@/state/alerts";
import { configReducer } from "@/state/config";
import { gameReducer, loadedGameReducer } from "@/state/game";
import { combineReducers } from "@/state/helpers";
import storage from "@/state/storage";
import { summariesReducer } from "@/state/summaries";
import { getGameSummary } from "@/util/loading.js";

const summaries = { bundled: mapObjIndexed(getGameSummary, games) };

export const initialState = { alert: ALERT_DEFAULT, summaries, config: {} };
export const preloadedState = mergeDeepRight(
  initialState,
  storage.initialState(),
);

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
  preloadedState,
});

storage.listen(store);
