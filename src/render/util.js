const map = require("ramda/src/map");
const is = require("ramda/src/is");
const fs = require("fs");

const compileCompanies = (game) => {
  return map((company) => {
    if (
      company.minor &&
      !company.tokens &&
      game.tokenTypes &&
      game.tokenTypes["minor"]
    ) {
      company.tokenType = "minor";
      company.tokens = game.tokenTypes["minor"];
    } else if (
      !company.tokens &&
      game.tokenTypes &&
      game.tokenTypes["default"]
    ) {
      company.tokenType = "default";
      company.tokens = game.tokenTypes["default"];
    } else if (is(String, company.tokens)) {
      company.tokenType = company.tokens;
      company.tokens = game.tokenTypes[company.tokens];
    }

    if (
      company.minor &&
      !company.shares &&
      game.shareTypes &&
      game.shareTypes["minor"]
    ) {
      company.shareType = "minor";
      company.shares = game.shareTypes["minor"];
    } else if (
      !company.shares &&
      game.shareTypes &&
      game.shareTypes["default"]
    ) {
      company.shareType = "default";
      company.shares = game.shareTypes["default"];
    } else if (is(String, company.shares)) {
      company.shareType = company.shares;
      company.shares = game.shareTypes[company.shares];
    }

    return company;
  }, game.companies || []);
};

const setupB18 = (game, version) => {
  setupGame(game);
  let id = `${game}-${version}`;
  let folder = `board18-${id}`;
  try {
    fs.mkdirSync(`./build/render/${game}/${folder}`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  try {
    fs.mkdirSync(`./build/render/${game}/${folder}/${id}`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

const setup18xxGame = (filename, newFilename) => {
  setupGame(filename);
  try {
    fs.mkdirSync(`./build/render/${filename}/18xx.games`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  try {
    fs.mkdirSync(`./build/render/${filename}/18xx.games/${newFilename}`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

const setupGame = (game) => {
  try {
    fs.mkdirSync(`./build/render/${game}`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

const setup = () => {
  try {
    fs.mkdirSync(`./build`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }

  try {
    fs.mkdirSync(`./build/render`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

exports.compileCompanies = compileCompanies;
exports.setupB18 = setupB18;
exports.setup18xxGame = setup18xxGame;
exports.setupGame = setupGame;
exports.setup = setup;
