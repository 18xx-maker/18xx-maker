import { compose, createStore } from "redux";
import persistState from "redux-localstorage";
import rootReducer from "./reducers";

import mergeDeepRight from "ramda/src/mergeDeepRight";

import defaultConfig from "../defaults.json";
import customConfig from "../config.json";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(persistState("config", {
  merge: (initial, persisted) => {
    return mergeDeepRight(initial, persisted || {});
  }
}));

const initial = {
  config: mergeDeepRight(defaultConfig, customConfig)
};

const store = createStore(rootReducer, initial, enhancer);

export default store;
