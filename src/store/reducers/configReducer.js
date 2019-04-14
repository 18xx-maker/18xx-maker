import assoc from "ramda/src/assoc";
import {SET_CONFIG, SET_SCHEME} from "../actions";

const configReducer = (state = {}, action) => {
  switch(action.type) {
  case SET_CONFIG:
    return action.config;
  case SET_SCHEME:
    return assoc("scheme", action.scheme, state);
  default:
    return state;
  }
};

export default configReducer;
