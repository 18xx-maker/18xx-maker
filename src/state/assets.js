import { dissoc } from "ramda";

import { bundledAssets } from "@/data/gameAssets";
import { DELETE_GAME } from "@/state/game";
import { sanitizeAssets } from "@/util/assets";
import capability from "@/util/capability";
import { BUNDLED, ELECTRON } from "@/util/loading";
import * as assetStore from "@/util/storage/assets";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";

export const SET_ASSETS = "SET_ASSETS";

// The custom images of the games that were opened, keyed by game slug. The
// slice is never mirrored to local storage (state/storage): images live in
// the game's folder, in IndexedDB or in the bundle, never in the game JSON.
export const createSetAssets = (slug, assets) => ({
  type: SET_ASSETS,
  slug,
  assets,
});

// The images a game has, read from where its type keeps them. Never rejects:
// a game without readable images is a game without images.
//   bundled: the bundle; system and internal: IndexedDB; electron: the preload
//   `loadAssets(id)`, which the main process answers from <game>.assets
export const readAssets = async ({ type, id, slug }) => {
  try {
    if (type === BUNDLED) return bundledAssets[id];
    if ((type === idb.TYPE || type === opfs.TYPE) && capability.apis.idb) {
      return sanitizeAssets(await assetStore.listAssets(slug));
    }
    if (type === ELECTRON && typeof window.api?.loadAssets === "function") {
      return sanitizeAssets(await window.api.loadAssets(id));
    }
  } catch (e) {
    console.error(e);
  }
  return undefined;
};

// Puts the images of a game into the state. Nothing is dispatched for a game
// that has none and had none.
export const hydrateAssets = async (dispatch, getState, meta) => {
  const assets = await readAssets(meta);
  if (assets || getState().assets?.[meta.slug]) {
    dispatch(createSetAssets(meta.slug, assets));
  }
  return assets;
};

export const loadAssets = (meta) => (dispatch, getState) =>
  hydrateAssets(dispatch, getState, meta);

// Writes through to IndexedDB (the web app: system and internal games) and
// refreshes the state. A failure is rethrown with the code of
// util/storage/assets ("exists", "count", "quota" ...), the caller alerts.
const write = (slug, fn) => async (dispatch, getState) => {
  const [type, id] = [slug.split(":")[0], slug.slice(slug.indexOf(":") + 1)];
  await fn();
  await dispatch(loadAssets({ type, id, slug }));
  return getState().assets?.[slug];
};

export const addGameAsset = (slug, kind, name, value, options) =>
  write(slug, () => assetStore.putAsset(slug, kind, name, value, options));

export const renameGameAsset = (slug, kind, from, to) =>
  write(slug, () => assetStore.renameAsset(slug, kind, from, to));

export const removeGameAsset = (slug, kind, name) =>
  write(slug, () => assetStore.deleteAsset(slug, kind, name));

export const assetsReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_ASSETS:
      return action.assets
        ? { ...state, [action.slug]: action.assets }
        : dissoc(action.slug, state);
    case DELETE_GAME:
      return dissoc(action.meta.slug, state);
    default:
      return state;
  }
};
