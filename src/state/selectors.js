import { createSelector, lruMemoize } from "@reduxjs/toolkit";

import { equals, keys, omit, union } from "ramda";

import { games } from "@/data";
import { resolveConfig } from "@/util/resolveConfig";

// Selectors take the state plus whatever they need from the route as plain
// arguments: they never read the router.

export const selectStoredConfig = (state) => state.config;

// The custom images of the game on screen (util/assets), if it has any
export const selectAssets = (state) => state.assets?.[state.game?.meta?.slug];

// Settings are all optional: no theme means the system one, no sidebarOpen
// means open, no language means the detected one and no openExportFolder
// means off
export const selectTheme = (state) => state.settings?.theme;
export const selectSidebarOpen = (state) => state.settings?.sidebarOpen;
export const selectLanguage = (state) => {
  const language = state.settings?.language;
  return typeof language === "string" && language ? language : undefined;
};

// Off unless the setting is exactly true (the app shows exports in the folder)
export const selectOpenExportFolder = (state) =>
  state.settings?.openExportFolder === true;

// The key mode of the JSON editor: normal unless the setting is vim or emacs
export const selectEditorKeys = (state) => {
  const keys = state.settings?.editorKeys;
  return keys === "vim" || keys === "emacs" ? keys : "normal";
};

export const selectExportMenuOpen = (state) => !!state.ui?.exportMenuOpen;
export const selectExportSheetOpen = (state) => !!state.ui?.exportSheetOpen;
export const selectPanelState = (state, key) => state.ui?.panel?.[key];

// The redux game, whatever the route
export const selectGameState = (state) => state.game;

// The game as it is in its file and what the saves of this session replaced
export const selectGameOriginal = (state) => state.gameOriginal;
export const selectGameHistory = (state) => state.gameHistory;

// The top level fields of the game that have unsaved edits (the meta is not in
// the file)
export const selectGameChangedFields = createSelector(
  [selectGameState, selectGameOriginal],
  (game, original) => {
    if (!game || !original || game === original) return [];
    return union(keys(omit(["meta"], game)), keys(omit(["meta"], original)))
      .filter((key) => !equals(game[key], original[key]))
      .sort();
  },
);

// Whether the game has edits that are not saved
export const selectGameChanged = (state) =>
  selectGameChangedFields(state).length > 0;

// The game when the URL slug names it, otherwise undefined. A previously
// loaded game must not render under another game's URL.
export const selectGameForSlug = (state, slug) => {
  const game = state.game;
  return slug && game?.meta.slug === slug ? game : undefined;
};

// The game for the current page: the redux game on game pages (inGames) and
// the bundled 1889 everywhere else on the site.
export const selectGame = (state, inGames) =>
  inGames ? state.game : games["1889"];

// Builds the memoized selector of the resolved config: (state, search, game)
// returns { config, searchConfig, gameConfig }. Identical inputs (stored
// config, search string and game config) return the identical object.
export const createConfigSelector = (defaults, user, render = false) =>
  createSelector(
    [
      selectStoredConfig,
      (_state, search) => search,
      (_state, _s, game) => game?.config,
    ],
    (stored, search, gameConfig) =>
      resolveConfig({ defaults, user, stored, search, gameConfig, render }),
    // Searches are free text: keep a few results rather than one per string
    {
      memoize: lruMemoize,
      memoizeOptions: { maxSize: 10 },
      argsMemoize: lruMemoize,
      argsMemoizeOptions: { maxSize: 10 },
    },
  );
