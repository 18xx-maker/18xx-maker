import { configureStore } from "@reduxjs/toolkit";

import { mapObjIndexed, mergeDeepRight } from "ramda";

import { games } from "@/data";
import { ALERT_DEFAULT, alertReducer } from "@/state/alerts";
import { configReducer } from "@/state/config";
import { errorsReducer } from "@/state/errors";
import { gameReducer, loadedGameReducer } from "@/state/game";
import { combineReducers } from "@/state/helpers";
import storage from "@/state/storage";
import { summariesReducer } from "@/state/summaries";
import { updateReducer } from "@/state/update";
import { getGameSummary } from "@/util/loading.js";

const summaries = { bundled: mapObjIndexed(getGameSummary, games) };

export const initialState = {
  alert: ALERT_DEFAULT,
  summaries,
  config: {},
  errors: {},
};

// Pick which top level fields we want to keep in local storage
storage.init("config", "loadedGame");

export const preloadedState = mergeDeepRight(
  initialState,
  storage.initialState(),
);

export const rootReducer = combineReducers({
  alert: alertReducer,
  loadedGame: loadedGameReducer,
  update: updateReducer,
  summaries: summariesReducer,
  config: configReducer,
  game: gameReducer,
  errors: errorsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

storage.listen(store);
