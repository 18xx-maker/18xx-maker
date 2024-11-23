import { assoc } from "ramda";

export const SET_UPDATE = "SET_UPDATE";
export const createUpdate = (update) => ({
  type: SET_UPDATE,
  update,
});

export const SET_DOWNLOAD_PERCENT = "SET_DOWNLOAD_PERCENT";
export const createDownloadPercent = (percent) => ({
  type: SET_DOWNLOAD_PERCENT,
  downloading: percent,
});

export const updateReducer = (state = undefined, action) => {
  switch (action.type) {
    case SET_UPDATE:
      return action.update;
    case SET_DOWNLOAD_PERCENT:
      return assoc("downloading", action.downloading, state);
    default:
      return state;
  }
};
