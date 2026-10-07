import { useCallback } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

import { createSetPanelState } from "@/state";
import { selectPanelState } from "@/state/selectors";

// State of the edit panel that outlives its components (a change of tab), in
// the ui store under a key. The setter takes a value or a function of the
// current value, like the one of useState.
export const usePanelState = (key, initial) => {
  const dispatch = useDispatch();
  const store = useStore();
  const value = useSelector((state) => selectPanelState(state, key)) ?? initial;
  const set = useCallback(
    (next) => {
      const current = selectPanelState(store.getState(), key) ?? initial;
      dispatch(
        createSetPanelState(
          key,
          typeof next === "function" ? next(current) : next,
        ),
      );
    },
    [dispatch, store, key, initial],
  );
  return [value, set];
};
