import fs from "node:fs";
import path from "node:path";

import { is, map } from "ramda";

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

export const loadGame = (game) =>
  JSON.parse(
    fs.readFileSync(
      path.join(import.meta.dirname, `../data/games/${game}.json`),
    ),
  );

export const loadSchema = (schema) =>
  JSON.parse(
    fs.readFileSync(path.join(import.meta.dirname, `../schemas/${schema}`)),
  );
