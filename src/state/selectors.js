import { createSelector } from "@reduxjs/toolkit";

import { games } from "@/data";
import { resolveConfig } from "@/util/resolveConfig";

// Selectors take the state plus whatever they need from the route as plain
// arguments: they never read the router.

export const selectStoredConfig = (state) => state.config;

// Settings are all optional: no theme means the system one, no sidebarOpen
// means open and no language means the detected one
export const selectTheme = (state) => state.settings?.theme;
export const selectSidebarOpen = (state) => state.settings?.sidebarOpen;
export const selectLanguage = (state) => state.settings?.language;

export const selectExportMenuOpen = (state) => !!state.ui?.exportMenuOpen;
export const selectExportSheetOpen = (state) => !!state.ui?.exportSheetOpen;

// The redux game, whatever the route
export const selectGameState = (state) => state.game;

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
export const createConfigSelector = (defaults, user) =>
  createSelector(
    [
      selectStoredConfig,
      (_state, search) => search,
      (_state, _s, game) => game?.config,
    ],
    (stored, search, gameConfig) =>
      resolveConfig({ defaults, user, stored, search, gameConfig }),
  );
