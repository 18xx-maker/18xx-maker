// Transient interface state. Never persisted: it starts closed on every load.
export const SET_EXPORT_MENU_OPEN = "SET_EXPORT_MENU_OPEN";
export const SET_EXPORT_SHEET_OPEN = "SET_EXPORT_SHEET_OPEN";

export const UI_DEFAULT = { exportMenuOpen: false, exportSheetOpen: false };

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
    default:
      return state;
  }
};
