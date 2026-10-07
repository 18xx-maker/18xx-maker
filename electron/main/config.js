import fs from "node:fs";
import { join, resolve } from "node:path";

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
export const EXPORT_FOLDER = "exportFolder";
export const CONFIG_KEYS = [SUMMARIES, RECENTS, LAST_ROUTE, EXPORT_FOLDER];
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

const readConfig = () =>
  pick(
    CONFIG_KEYS,
    mergeDeepRight(
      DEFAULT_CONFIG,
      fs.existsSync(CONFIG_FILE)
        ? JSON.parse(fs.readFileSync(CONFIG_FILE))
        : {},
    ),
  );

// Where a config that could not be read is kept, once: the first copy is the
// one worth keeping, a later reset must not overwrite it
const backup = () => {
  const bak = `${CONFIG_FILE}.bak`;
  try {
    if (!fs.existsSync(bak)) fs.copyFileSync(CONFIG_FILE, bak);
  } catch (backupError) {
    console.error("Unable to back up invalid config:", backupError);
  }
};

// Loading runs when the main process starts, so it never throws: a file that
// can not be read is backed up and replaced by the default, and one that can
// not be written is kept in memory
export const loadConfig = () => {
  let cleaned;
  try {
    config = readConfig();
    cleaned = cleanConfig(config);
  } catch (e) {
    // The config file is unreadable or in a state we can't clean. Back it up
    // and start over rather than leaving the app unusable.
    console.error("Resetting invalid config:", e);
    backup();
    config = null;
    cleaned = DEFAULT_CONFIG;
  }

  try {
    return updateConfig(() => cleaned);
  } catch (e) {
    console.error("Unable to write config:", e);
    return config;
  }
};

export const getConfig = () => config || loadConfig();

// The file is replaced whole: written beside it and renamed over it, so that
// a crash never leaves half a config. Where that is not possible (a rename over
// a file that is open on Windows, a folder that can not be written) it is
// written in place.
const writeConfigFile = (text) => {
  const tmp = `${CONFIG_FILE}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(tmp, text);
    fs.renameSync(tmp, CONFIG_FILE);
  } catch {
    try {
      fs.unlinkSync(tmp);
    } catch {
      // Never written, or already renamed
    }
    fs.writeFileSync(CONFIG_FILE, text);
  }
};

export const updateConfig = (op) => {
  let newConfig = op(config);

  if (!equals(newConfig, config)) {
    config = newConfig;
    writeConfigFile(JSON.stringify(config, null, 2));
  }

  return config;
};

export const getLastRoute = () => prop(LAST_ROUTE, getConfig());
export const setLastRoute = (url) => updateConfig(assoc(LAST_ROUTE, url));

export const getExportFolder = () => prop(EXPORT_FOLDER, getConfig());
export const setExportFolder = (folder) =>
  updateConfig(assoc(EXPORT_FOLDER, folder));
export const clearExportFolder = () => updateConfig(dissoc(EXPORT_FOLDER));

export const deleteGame = (id) =>
  updateConfig((config) => {
    return {
      ...config,
      summaries: dissoc(id, config.summaries),
      recents: reject(propEq(`electron:${id}`, "slug"), config.recents),
    };
  });
// A path is the same one however it is written (and in any case on Windows)
export const samePath = (a, b) => {
  const [x, y] = [resolve(a), resolve(b)];
  return process.platform === "win32"
    ? x.toLowerCase() === y.toLowerCase()
    : x === y;
};
export const summaryOfPath = (file) =>
  Object.values(getConfig().summaries).find(
    (summary) =>
      typeof summary.path === "string" && samePath(summary.path, file),
  );
// The summary and slug of the game that has its file at path, if there is one
export const slugOfPath = (file) => summaryOfPath(file)?.slug;

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
