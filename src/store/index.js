import { compose, createStore } from "redux";
import persistState from "redux-localstorage";
import rootReducer from "./reducers";
import { scheme } from "../data";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(persistState("config"));

const initial = {
  config: { scheme }
};

const store = createStore(rootReducer, initial, enhancer);

export default store;
