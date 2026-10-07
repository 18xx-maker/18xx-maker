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
    default:
      return state;
  }
};
