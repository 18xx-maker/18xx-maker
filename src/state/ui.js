import { DELETE_GAME, SET_GAME } from "@/state/game";

// Transient interface state. Never persisted: it starts closed on every load.
export const SET_EXPORT_MENU_OPEN = "SET_EXPORT_MENU_OPEN";
export const SET_EXPORT_SHEET_OPEN = "SET_EXPORT_SHEET_OPEN";
export const SET_PANEL_STATE = "SET_PANEL_STATE";

// panel holds the state of the edit panel (what is open or shown as more) by a
// key made from the path of the field, so it survives a change of tab
export const UI_DEFAULT = {
  exportMenuOpen: false,
  exportSheetOpen: false,
  panel: {},
};

export const createSetPanelState = (key, value) => ({
  type: SET_PANEL_STATE,
  key,
  value,
});

export const createSetExportMenuOpen = (open) => ({
  type: SET_EXPORT_MENU_OPEN,
  open,
});

export const createSetExportSheetOpen = (open) => ({
  type: SET_EXPORT_SHEET_OPEN,
  open,
});

export const uiReducer = (state = UI_DEFAULT, action) => {
  switch (action.type) {
    case SET_EXPORT_MENU_OPEN:
      return { ...state, exportMenuOpen: !!action.open };
    case SET_EXPORT_SHEET_OPEN:
      return { ...state, exportSheetOpen: !!action.open };
    case SET_PANEL_STATE:
      return {
        ...state,
        panel: { ...state.panel, [action.key]: action.value },
      };
    // What is open belongs to the game that was edited. A reload that keeps the
    // edits keeps it too.
    case SET_GAME:
      return action.keepEdits ? state : { ...state, panel: {} };
    case DELETE_GAME:
      return { ...state, panel: {} };
    default:
      return state;
  }
};
