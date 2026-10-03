import fs from "node:fs";
import path from "node:path";

import express from "express";

import { is, map } from "ramda";

// A mistake in how the command was used (unknown game, site not built). The
// CLI exits with code 2 for these.
export class UsageError extends Error {}

export const compileCompanyTokens = (game, companies) => {
  return map((company) => {
    if (
      company.minor &&
      !company.tokens &&
      game.tokenTypes &&
      game.tokenTypes["minor"]
    ) {
      return {
        ...company,
        tokenType: "minor",
        tokens: [...game.tokenTypes["minor"]],
      };
    } else if (
      !company.tokens &&
      game.tokenTypes &&
      game.tokenTypes["default"]
    ) {
      return {
        ...company,
        tokenType: "default",
        tokens: [...game.tokenTypes["default"]],
      };
    } else if (is(String, company.tokens)) {
      return {
        ...company,
        tokenType: company.tokens,
        tokens: [...game.tokenTypes[company.tokens]],
      };
    } else {
      return company;
    }
  }, companies || []);
};

export const compileCompanyShares = (game, companies) => {
  return map((company) => {
    if (
      company.minor &&
      !company.shares &&
      game.shareTypes &&
      game.shareTypes["minor"]
    ) {
      return {
        ...company,
        shareType: "minor",
        shares: [...game.shareTypes["minor"]],
      };
    } else if (
      !company.shares &&
      game.shareTypes &&
      game.shareTypes["default"]
    ) {
      return {
        ...company,
        shareType: "default",
        shares: [...game.shareTypes["default"]],
      };
    } else if (is(String, company.shares)) {
      return {
        ...company,
        shareType: company.shares,
        shares: [...game.shareTypes[company.shares]],
      };
    } else {
      return company;
    }
  }, companies || []);
};

export const compileCompanies = (game) => {
  return compileCompanyTokens(game, compileCompanyShares(game, game.companies));
};

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

export const defaultConfig = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "../defaults.json"), "utf-8"),
);

export let customConfig = {};
if (fs.existsSync(path.join(import.meta.dirname, "../config.json"))) {
  customConfig = JSON.parse(
    fs.readFileSync(path.join(import.meta.dirname, "../config.json"), "utf-8"),
  );
}

export const loadJSON = (file) => JSON.parse(fs.readFileSync(file));

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

export const startExpress = (port = 9000) => {
  const site = path.join(import.meta.dirname, "../../dist/site");
  if (!fs.existsSync(path.join(site, "index.html"))) {
    throw new UsageError("The site is not built, run pnpm build first");
  }

  const app = express();
  app.use(express.static(site));
  app.get("/{*path}", function (req, res) {
    // With a root the folders above it are not checked for dots, a checkout
    // inside a .folder (a git worktree under .claude) is not a 404
    res.sendFile("index.html", { root: site });
  });
  // Only this machine can reach the site
  return app.listen(port, "127.0.0.1");
};
