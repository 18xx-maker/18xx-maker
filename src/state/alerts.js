import { objOf } from "ramda";

export const SET_ALERT = "SET_ALERT";
export const CLEAR_ALERT = "CLEAR_ALERT";

export const createProgressAlert = (title, message, progress) => ({
  type: SET_ALERT,
  alert: { title, message, progress },
});

export const createAlert = (title, message, type = "info") => ({
  type: SET_ALERT,
  alert: { title, message, type },
});

export const clearAlert = () => objOf("type", CLEAR_ALERT);

export const ALERT_DEFAULT = { open: false };
export const alertReducer = (state = ALERT_DEFAULT, action) => {
  switch (action.type) {
    case SET_ALERT:
      return { open: true, ...action.alert };
    case CLEAR_ALERT:
      return ALERT_DEFAULT;
    default:
      return state;
  }
};
