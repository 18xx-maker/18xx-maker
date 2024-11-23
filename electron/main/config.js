import fs from "node:fs";
import { join } from "node:path";

import { app } from "electron";

import {
  assoc,
  assocPath,
  dissocPath,
  equals,
  mergeDeepRight,
  path,
  pick,
  prop,
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

export const loadConfig = () =>
  (config = pick(
    CONFIG_KEYS,
    mergeDeepRight(
      DEFAULT_CONFIG,
      fs.existsSync(CONFIG_FILE)
        ? JSON.parse(fs.readFileSync(CONFIG_FILE))
        : {},
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
