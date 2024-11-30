export const SET_ERRORS = "SET_ERRORS";
export const RESET_ERRORS = "SET_ERRORS";

export const createSetErrors = (errors) => ({
  type: SET_ERRORS,
  errors,
});

export const createResetErrors = () => ({
  type: RESET_ERRORS,
});

export const errorsReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_ERRORS:
      return { ...action.errors };
    case RESET_ERRORS:
      return {};
    default:
      return state;
  }
};
