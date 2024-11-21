import {
  apply,
  lensPath,
  lensProp,
  map,
  mapObjIndexed,
  mergeRight,
  over,
  reduceRight,
  split,
  toPairs,
} from "ramda";

export const combineReducers =
  (reducers) =>
  (state = {}, action) =>
    mergeRight(
      state,
      mapObjIndexed(
        (reducer, slice) => reducer(state[slice], action),
        reducers,
      ),
    );

export const composeReducers =
  (...reducers) =>
  (state, action) =>
    reduceRight((reducer, s) => reducer(s, action), state, reducers);

export const reducePath =
  (path = [], reducer = () => {}) =>
  (state, action) =>
    over(lensPath(path), (subState) => reducer(subState, action), state);

export const combinePathReducers = (reducers) =>
  apply(
    composeReducers,
    map(
      apply(reducePath),
      map(over(lensProp(0), split(".")), toPairs(reducers)),
    ),
  );
