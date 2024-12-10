import { configureStore } from "@reduxjs/toolkit";

import { mapObjIndexed, mergeDeepRight } from "ramda";

import { games } from "@/data";
import { ALERT_DEFAULT, alertReducer } from "@/state/alerts";
import { configReducer } from "@/state/config";
import { errorsReducer } from "@/state/errors";
import { gameReducer, loadedGameReducer } from "@/state/game";
import { combineReducers } from "@/state/helpers";
import { settingsReducer } from "@/state/settings";
import storage from "@/state/storage";
import { summariesReducer } from "@/state/summaries";
import { updateReducer } from "@/state/update";
import { getGameSummary } from "@/util/loading.js";

const summaries = { bundled: mapObjIndexed(getGameSummary, games) };

export const initialState = {
  alert: ALERT_DEFAULT,
  summaries,
  config: {},
  settings: {},
  errors: {},
};

// Pick which top level fields we want to keep in local storage
storage.init("config", "loadedGame", "settings");

export const preloadedState = mergeDeepRight(
  initialState,
  storage.initialState(),
);

export const rootReducer = combineReducers({
  alert: alertReducer,
  loadedGame: loadedGameReducer,
  update: updateReducer,
  summaries: summariesReducer,
  settings: settingsReducer,
  config: configReducer,
  game: gameReducer,
  errors: errorsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

storage.listen(store);
