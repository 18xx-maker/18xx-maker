import { dissoc } from "ramda";

export const SET_SETTINGS = "SET_SETTINGS";

export const SET_SIDEBAR_OPEN = "SET_SIDEBAR_OPEN";
export const SET_LANGUAGE = "SET_LANGUAGE";
export const SET_OPEN_EXPORT_FOLDER = "SET_OPEN_EXPORT_FOLDER";
export const SET_EDITOR_KEYS = "SET_EDITOR_KEYS";

export const createSetSettings = (settings) => ({
  type: SET_SETTINGS,
  settings,
});

export const createSetSidebarOpen = (open) => ({
  type: SET_SIDEBAR_OPEN,
  open,
});

export const createSetLanguage = (language) => ({
  type: SET_LANGUAGE,
  language,
});

export const createSetOpenExportFolder = (open) => ({
  type: SET_OPEN_EXPORT_FOLDER,
  open,
});

export const createSetEditorKeys = (keys) => ({
  type: SET_EDITOR_KEYS,
  keys,
});

export const settingsReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_SETTINGS:
      return action.settings;
    case SET_SIDEBAR_OPEN:
      return { ...state, sidebarOpen: action.open };
    case SET_LANGUAGE:
      // Only a language code is stored: anything else clears the setting
      return {
        ...state,
        language:
          typeof action.language === "string" && action.language
            ? action.language
            : undefined,
      };
    case SET_OPEN_EXPORT_FOLDER: {
      // Off is the default, so only true is stored
      return action.open === true
        ? { ...state, openExportFolder: true }
        : dissoc("openExportFolder", state);
    }
    case SET_EDITOR_KEYS:
      // Normal is the default, so only vim and emacs are stored
      return action.keys === "vim" || action.keys === "emacs"
        ? { ...state, editorKeys: action.keys }
        : dissoc("editorKeys", state);
    default:
      return state;
  }
};
