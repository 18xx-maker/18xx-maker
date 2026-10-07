import fs from "node:fs";
import http from "node:http";
import path from "node:path";

import sirv from "sirv";

import { map } from "ramda";

// A mistake in how the command was used (unknown game, site not built). The
// CLI exits with code 2 for these.
export class UsageError extends Error {}

export {
  compileCompanies,
  compileCompanyShares,
  compileCompanyTokens,
} from "../util/index.js";

export const setupB18 = (game, version) => {
  setupGame(game);
  let id = `${game}-${version}`;
  let folder = `board18-${id}`;
  try {
    fs.mkdirSync(`./render/${game}/${folder}`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  try {
    fs.mkdirSync(`./render/${game}/${folder}/${id}`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

export const setup18xxGame = (filename, newFilename) => {
  setupGame(filename);
  try {
    fs.mkdirSync(`./render/${filename}/18xx.games`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  try {
    fs.mkdirSync(`./render/${filename}/18xx.games/${newFilename}`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

export const setupGame = (game) => {
  try {
    fs.mkdirSync(`./render/${game}`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

export const setup = () => {
  try {
    fs.mkdirSync(`./render`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

export const loadJSON = (file) => JSON.parse(fs.readFileSync(file));

export const defaultConfig = loadJSON(
  path.join(import.meta.dirname, "../defaults.json"),
);

export let customConfig = {};
if (fs.existsSync(path.join(import.meta.dirname, "../config.json"))) {
  customConfig = loadJSON(path.join(import.meta.dirname, "../config.json"));
}

export const loadGame = (game) => {
  try {
    return loadJSON(
      path.join(import.meta.dirname, `../data/games/${game}.json`),
    );
  } catch (err) {
    if (err.code === "ENOENT") throw new UsageError(`Game ${game} not found`);
    throw err;
  }
};

// The company override sets by name, like the app has them in src/data
export const loadCompanyOverrides = () => {
  const dir = path.join(import.meta.dirname, "../data/companies");
  return Object.fromEntries(
    fs
      .readdirSync(dir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => [
        name.replace(/\.json$/, ""),
        loadJSON(path.join(dir, name)),
      ]),
  );
};

export const loadSchema = (schema) =>
  loadJSON(path.join(import.meta.dirname, `../schemas/${schema}`));

export const loadTiles = () =>
  map(
    (name) =>
      loadJSON(path.join(import.meta.dirname, `../data/tiles/${name}.json`)),
    ["yellow", "green", "brown", "gray", "other"],
  );

export const startServer = (
  port = 9000,
  site = path.join(import.meta.dirname, "../../dist/site"),
) => {
  if (!fs.existsSync(path.join(site, "index.html"))) {
    throw new UsageError("The site is not built, run pnpm build first");
  }

  // single: unknown routes get index.html so the app can route them;
  // ignores: false so routes ending in a dotted segment (tiles/57.1) do too
  const serve = sirv(site, { single: true, ignores: false });
  // Only this machine can reach the site
  return http.createServer(serve).listen(port, "127.0.0.1");
};
