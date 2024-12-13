import fs from "node:fs";
import { join } from "node:path";

import { app } from "electron";
import { v4 as uuidv4, validate } from "uuid";

import {
  apply,
  assoc,
  assocPath,
  chain,
  compose,
  dissoc,
  equals,
  filter,
  find,
  forEach,
  fromPairs,
  keys,
  lensProp,
  mergeDeepRight,
  nth,
  over,
  path,
  pick,
  prop,
  propEq,
  reject,
  toPairs,
} from "ramda";

import { isDev } from "./dev.js";

export const SUMMARIES = "summaries";
export const RECENTS = "recents";
export const LAST_ROUTE = "lastRoute";
export const CONFIG_KEYS = [SUMMARIES, RECENTS, LAST_ROUTE];
export const DEFAULT_CONFIG = { [SUMMARIES]: {}, [RECENTS]: [] };

export const CONFIG_FILE = isDev
  ? join(import.meta.dirname, "../config.json")
  : join(app.getPath("userData"), "config.json");

export const info = compose(
  pick(["title", "subtitle", "designer", "publisher"]),
  prop("info"),
);

let config = null;

// This removes any summaries where the id/type/slug relationship doesn't
// work. When this happens the electron main process can't communicate properly
// with the client. The client might ask for a game that doesn't exist and the
// backend can't find it to fix.
const cleanInvalidSummarySlugs = over(
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

const convertToUUID = (config) => {
  const oldIds = keys(config.summaries);

  const summaries = {};
  forEach((oldId) => {
    if (validate(oldId)) {
      // Already good!
      summaries[oldId] = config.summaries[oldId];
      return;
    }

    // Needs a new id
    const id = uuidv4();
    summaries[id] = {
      ...config.summaries[oldId],
      id,
      slug: `electron:${id}`,
    };
  }, oldIds);

  return {
    ...config,
    summaries,
  };
};

const fixRecents = (config) => ({
  ...config,
  recents: chain((recent) => {
    if (recent.slug && !recent.slug.startsWith("electron:")) {
      return [recent];
    }

    const summary = find(
      compose(propEq(recent.title, "title"), nth(1)),
      toPairs(config.summaries),
    );

    // Nothing found, bad recent
    if (!summary) {
      return [];
    }

    return {
      title: recent.title,
      slug: summary[1].slug,
    };
  }, config.recents),
});

const cleanConfig = apply(compose, [
  fixRecents,
  cleanInvalidSummarySlugs,
  convertToUUID,
]);

export const loadConfig = () => {
  config = pick(
    CONFIG_KEYS,
    mergeDeepRight(
      DEFAULT_CONFIG,
      fs.existsSync(CONFIG_FILE)
        ? JSON.parse(fs.readFileSync(CONFIG_FILE))
        : {},
    ),
  );
  return updateConfig(cleanConfig);
};

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

export const deleteGame = (id) =>
  updateConfig((config) => {
    return {
      ...config,
      summaries: dissoc(id, config.summaries),
      recents: reject(propEq(`electron:${id}`, "slug"), config.recents),
    };
  });
export const getSummaries = () => prop(SUMMARIES, getConfig());
export const getSummary = (id) => path([SUMMARIES, id], getConfig());
export const updateSummaries = (game) =>
  updateConfig(
    assocPath(
      [SUMMARIES, game.meta.id],
      mergeDeepRight(getSummary(game.meta.id), {
        ...info(game),
        ...game.meta,
      }),
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
