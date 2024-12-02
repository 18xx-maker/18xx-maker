export const SET_SETTINGS = "SET_SETTINGS";

export const createSetSettings = (settings) => ({
  type: SET_SETTINGS,
  settings,
});

export const settingsReducer = (state = { theme: "system" }, action) => {
  switch (action.type) {
    case SET_SETTINGS:
      return action.settings;
    default:
      return state;
  }
};
