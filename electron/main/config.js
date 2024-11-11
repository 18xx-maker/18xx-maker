import { app } from "electron";
import {
  assocPath,
  dissocPath,
  equals,
  keys,
  mergeDeepRight,
  path,
  pick,
  prop,
} from "ramda";

import fs from "node:fs";
import { join } from "node:path";

import { getGameSummary } from "../../src/util/loading.js";

export const DEFAULT_CONFIG = { summaries: {}, recents: [] };
export const CONFIG_FILE = join(app.getPath("userData"), "config.json");

let config = null;

export const loadConfig = () =>
  (config = pick(
    keys(DEFAULT_CONFIG),
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

export const deleteGame = (id) => updateConfig(dissocPath(["summaries", id]));
export const getSummaries = () => prop("summaries", getConfig());
export const getSummary = (id) => path(["summaries", id], getConfig());
export const updateSummaries = (game) =>
  updateConfig(
    assocPath(
      ["summaries", game.meta.id],
      mergeDeepRight(getSummary(game.meta.id), getGameSummary(game)),
    ),
  );
export const getRecents = () => prop("recents", getConfig());
export const addRecent = (title, slug) => {
  return updateConfig((config) => {
    let recents = config.recents || [];
    recents = recents.filter((r) => r.slug !== slug);
    recents.unshift({ title, slug });
    recents = recents.slice(0, 10);

    return { ...config, recents };
  });
};
