import { renderGame } from "../export/render.js";

// Headless render mode: a page that is given the game and config it shows
// instead of loading them, and has no chrome. The caller sets
// window.__RENDER_INPUT__ (Playwright's addInitScript), window.api.renderInput
// (the Electron preload) or __RENDER_INPUT__ on the iframe element that holds
// the page (the web export: the parent is same-origin, and frameElement is null
// for a cross-origin parent) to
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
    // The input of the frame element is an object of the parent window: it is
    // cloned so its arrays are this window's Array (R.is(Array) is false for
    // the parent's)
    const frame = window.frameElement?.__RENDER_INPUT__;
    const given =
      window.__RENDER_INPUT__ ||
      (frame && structuredClone(frame)) ||
      (window.api || {}).renderInput;
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
