export const SET_ALERT = "SET_ALERT";
export const UPDATE_ALERT = "UPDATE_ALERT";
export const DISMISS_ALERT = "DISMISS_ALERT";
export const CLEAR_ALERT = "CLEAR_ALERT";

export const PROGRESS_ID = "progress";
export const MAX_ALERTS = 3;

// How long a toast stays before it dismisses itself (ms). Errors and
// in-progress toasts are sticky and have no duration.
const DURATIONS = { success: 5000, info: 5000, warning: 8000 };

export const createProgressAlert = (title, message, progress) => ({
  type: SET_ALERT,
  alert: { title, message, progress },
});

// opts: { sticky, duration } override the defaults of the type
export const createAlert = (title, message, type = "info", opts) => ({
  type: SET_ALERT,
  alert: { title, message, type, ...opts },
});

export const updateAlert = (id, alert) => ({ type: UPDATE_ALERT, id, alert });

export const dismissAlert = (id) => ({ type: DISMISS_ALERT, id });

// Without an id, clears every toast
export const clearAlert = (id) =>
  id === undefined ? { type: CLEAR_ALERT } : { type: CLEAR_ALERT, id };

export const selectAlerts = (state) => state.alert.items;
export const selectLatestAlert = (state) => state.alert.items.at(-1) ?? null;

export const ALERT_DEFAULT = { items: [], seq: 0 };

const withTiming = (item) => {
  const sticky =
    item.sticky ?? (item.progress !== undefined || item.type === "error");
  return {
    ...item,
    sticky,
    duration: sticky ? undefined : (item.duration ?? DURATIONS[item.type]),
  };
};

const cap = (items) => items.slice(-MAX_ALERTS);

const without = (items, id) => items.filter((item) => item.id !== id);

export const alertReducer = (state = ALERT_DEFAULT, action) => {
  switch (action.type) {
    case SET_ALERT: {
      const { progress } = action.alert;
      if (progress !== undefined) {
        // One progress toast, updated in place
        const item = withTiming({
          type: "info",
          ...action.alert,
          id: PROGRESS_ID,
        });
        const exists = state.items.some((i) => i.id === PROGRESS_ID);
        return {
          ...state,
          items: exists
            ? state.items.map((i) => (i.id === PROGRESS_ID ? item : i))
            : cap([...state.items, item]),
        };
      }
      // A result replaces the progress toast it follows
      const seq = state.seq + 1;
      const item = withTiming({ ...action.alert, id: `alert-${seq}` });
      return { seq, items: cap([...without(state.items, PROGRESS_ID), item]) };
    }
    case UPDATE_ALERT:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? withTiming({ ...item, ...action.alert, id: item.id })
            : item,
        ),
      };
    case DISMISS_ALERT:
      return { ...state, items: without(state.items, action.id) };
    case CLEAR_ALERT:
      return action.id === undefined
        ? { ...state, items: [] }
        : { ...state, items: without(state.items, action.id) };
    default:
      return state;
  }
};
