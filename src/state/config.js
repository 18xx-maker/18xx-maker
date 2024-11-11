export const SET_CONFIG = "SET_CONFIG";
export const RESET_CONFIG = "RESET_CONFIG";

export const createSetConfig = (config) => ({
  type: SET_CONFIG,
  config,
});

export const createResetConfig = () => ({
  type: RESET_CONFIG,
});

export const configReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_CONFIG:
      return { ...action.config };
    case RESET_CONFIG:
      return {};
    default:
      return state;
  }
};
