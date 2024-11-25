import fs from "node:fs";
import { join } from "node:path";

import { app } from "electron";

import {
  apply,
  assoc,
  assocPath,
  compose,
  dissocPath,
  equals,
  filter,
  fromPairs,
  lensProp,
  mergeDeepRight,
  over,
  path,
  pick,
  prop,
  toPairs,
} from "ramda";

import { getGameSummary } from "../../src/util/loading.js";
import { isDev } from "./dev.js";

export const SUMMARIES = "summaries";
export const RECENTS = "recents";
export const LAST_ROUTE = "lastRoute";
export const CONFIG_KEYS = [SUMMARIES, RECENTS, LAST_ROUTE];
export const DEFAULT_CONFIG = { [SUMMARIES]: {}, [RECENTS]: [] };

export const CONFIG_FILE = isDev
  ? join(import.meta.dirname, "../config.json")
  : join(app.getPath("userData"), "config.json");

let config = null;

// This removes any summaries where the id/type/slug relationship doesn't
// work. When this happens the electron main process can't communicate properly
// with the client. The client might ask for a game that doesn't exist and the
// backend can't find it to fix.
export const cleanInvalidSummarySlugs = over(
  lensProp("summaries"),
  compose(
    fromPairs,
    filter(([id, summary]) => {
      if (`${summary.type}:${id}` !== summary.slug) {
        return false;
      }

      if (`${summary.type}:${summary.id}` !== summary.slug) {
        return false;
      }

      return true;
    }),
    toPairs,
  ),
);
export const cleanConfig = apply(compose, [cleanInvalidSummarySlugs]);

export const loadConfig = () =>
  (config = cleanConfig(
    pick(
      CONFIG_KEYS,
      mergeDeepRight(
        DEFAULT_CONFIG,
        fs.existsSync(CONFIG_FILE)
          ? JSON.parse(fs.readFileSync(CONFIG_FILE))
          : {},
      ),
    ),
  ));

export const getConfig = () => config || loadConfig();
export const updateConfig = (op) => {
  let newConfig = op(config);

  if (!equals(newConfig, config)) {
    config = newConfig;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }

  return config;
};

export const getLastRoute = () => prop(LAST_ROUTE, getConfig());
export const setLastRoute = (url) => updateConfig(assoc(LAST_ROUTE, url));

export const deleteGame = (id) => updateConfig(dissocPath([SUMMARIES, id]));
export const getSummaries = () => prop(SUMMARIES, getConfig());
export const getSummary = (id) => path([SUMMARIES, id], getConfig());
export const updateSummaries = (game) =>
  updateConfig(
    assocPath(
      [SUMMARIES, game.meta.id],
      mergeDeepRight(getSummary(game.meta.id), getGameSummary(game)),
    ),
  );
export const getRecents = () => prop(RECENTS, getConfig());
export const addRecent = (title, slug) => {
  return updateConfig((config) => {
    let recents = config[RECENTS] || [];
    recents = recents.filter((r) => r.slug !== slug);
    recents.unshift({ title, slug });
    recents = recents.slice(0, 10);

    return { ...config, recents };
  });
};
