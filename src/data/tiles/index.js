const yellow = require("./yellow");
const green = require("./green");
const brown = require("./brown");
const gray = require("./gray");

const assoc = require("ramda/src/assoc");
const clone = require("ramda/src/clone");
const mapObjIndexed = require("ramda/src/mapObjIndexed");
const forEach = require("ramda/src/forEach");
const forEachObjIndexed = require("ramda/src/forEachObjIndexed");

let aliases = {};
const gatherAliases = (tiles) => {
  forEachObjIndexed((tile, id) => {
    forEach((alias) => {
      aliases[alias] = clone(tile);
    }, tile.aliases || []);
  }, tiles);
};

gatherAliases(yellow);
gatherAliases(green);
gatherAliases(brown);
gatherAliases(gray);

const allTiles = {
  ...yellow,
  ...green,
  ...brown,
  ...gray,
  ...aliases,
};

export default mapObjIndexed((tile, id) => assoc("id", id, tile), allTiles);
