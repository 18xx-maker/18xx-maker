import assoc from "ramda/es/assoc";
import {SET_SCHEME} from "../actions";

const configReducer = (state = {}, action) => {
  switch(action.type) {
  case SET_SCHEME:
    return assoc("scheme", action.scheme, state);
  default:
    return state;
  }
};

export default configReducer;
