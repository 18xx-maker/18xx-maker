import { compose, createStore } from "redux";
import persistState from "redux-localstorage";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(persistState("config"));

const initial = {
  config: {}
};

const store = createStore((state, action) => state, initial, enhancer);

export default store;
