import { DELETE_GAME, SET_GAME } from "@/state/game";

// Transient interface state. Never persisted: it starts closed on every load.
export const SET_EXPORT_MENU_OPEN = "SET_EXPORT_MENU_OPEN";
export const SET_EXPORT_SHEET_OPEN = "SET_EXPORT_SHEET_OPEN";
export const SET_PANEL_STATE = "SET_PANEL_STATE";
export const SET_LOADING_GAME = "SET_LOADING_GAME";
export const CLEAR_LOADING_GAME = "CLEAR_LOADING_GAME";

// panel holds the state of the edit panel (what is open or shown as more) by a
// key made from the path of the field, so it survives a change of tab.
// loadingGame is { name, id } while a dropped game is being stored and read
// (id tells one drop from the next), null otherwise.
export const UI_DEFAULT = {
  loadingGame: null,
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

export const createSetLoadingGame = (name, id) => ({
  type: SET_LOADING_GAME,
  name,
  id,
});

// Only clears the drop it was made for: a later drop keeps its own state
export const createClearLoadingGame = (id) => ({
  type: CLEAR_LOADING_GAME,
  id,
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
    case SET_LOADING_GAME:
      return { ...state, loadingGame: { name: action.name, id: action.id } };
    case CLEAR_LOADING_GAME:
      return state.loadingGame?.id === action.id
        ? { ...state, loadingGame: null }
        : state;
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
