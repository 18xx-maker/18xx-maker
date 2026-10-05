import { configureStore } from "@reduxjs/toolkit";

import { map, mergeDeepRight } from "ramda";

import { games } from "@/data";
import { ALERT_DEFAULT, alertReducer } from "@/state/alerts";
import { configReducer } from "@/state/config";
import { errorsReducer } from "@/state/errors";
import { gameReducer, loadedGameReducer } from "@/state/game";
import { gameProblemsReducer } from "@/state/gameProblems";
import { combineReducers } from "@/state/helpers";
import { settingsReducer } from "@/state/settings";
import storage from "@/state/storage";
import { summariesReducer } from "@/state/summaries";
import { UI_DEFAULT, uiReducer } from "@/state/ui";
import { updateReducer } from "@/state/update";
import { getGameSummary } from "@/util/loading.js";
import { getRenderInput } from "@/util/renderInput";

const summaries = { bundled: map((game) => getGameSummary(game), games) };

export const initialState = {
  alert: ALERT_DEFAULT,
  summaries,
  config: {},
  settings: {},
  errors: {},
  ui: UI_DEFAULT,
};

export const rootReducer = combineReducers({
  alert: alertReducer,
  loadedGame: loadedGameReducer,
  update: updateReducer,
  summaries: summariesReducer,
  settings: settingsReducer,
  config: configReducer,
  game: gameReducer,
  errors: errorsReducer,
  gameProblems: gameProblemsReducer,
  ui: uiReducer,
});

// Pick which top level fields we want to keep in local storage. Render mode
// (see util/renderInput) keeps everything in memory: it neither reads nor
// writes local storage, which belongs to the app.
const createPreloadedState = (render) => {
  if (render) {
    return initialState;
  }

  storage.init("config", "loadedGame", "settings");
  return mergeDeepRight(initialState, storage.initialState());
};

export const createStore = ({
  render = false,
  preloadedState = createPreloadedState(render),
} = {}) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  if (!render) {
    storage.listen(store);
  }

  return store;
};

const renderMode = !!getRenderInput();

export const preloadedState = createPreloadedState(renderMode);

export const store = createStore({ render: renderMode, preloadedState });
