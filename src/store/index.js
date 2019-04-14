import { compose, createStore } from "redux";
import persistState from "redux-localstorage";
import rootReducer from "./reducers";
import config from "../config.json";

import mergeDeepRight from "ramda/src/mergeDeepRight";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(persistState("config", {
  merge: (initial, persisted) => {
    return mergeDeepRight(initial, persisted || {});
  }
}));

const initial = {
  config
};

const store = createStore(rootReducer, initial, enhancer);

export default store;
