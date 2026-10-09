import { renderGame } from "../export/render.js";

// Headless render mode: a page that is given the game and config it shows
// instead of loading them, and has no chrome. The caller sets
// window.__RENDER_INPUT__ (Playwright's addInitScript) or window.api.renderInput
// (the Electron preload) to
//   { id, game, config, assets }
// where assets (optional) are the custom images of the game (util/assetNames),
// and config only has the layers below the URL parameters and the game's own
// config: the defaults, config.json and the user's config.
//
// The mode is decided once, when this is first called (the store does, at
// module load).
let input;
let decided = false;

export const getRenderInput = () => {
  if (!decided) {
    decided = true;
    const given = window.__RENDER_INPUT__ || (window.api || {}).renderInput;
    if (given) {
      const id = given.id ?? given.game.meta?.id;
      input = {
        id,
        game: renderGame(given.game, id),
        config: given.config,
        assets: given.assets,
      };
    }
  }

  return input;
};
