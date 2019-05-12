#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const R = require('ramda');

require("@babel/register");

const colors = {
  "yellow": {},
  "green": {},
  "brown": {},
  "gray": {}
};

const tiles = require("../src/data/tiles").default;
const ids = R.keys(tiles);
ids.sort();

R.forEach(id => {
  let tile = tiles[id];
  colors[tile.color][id] = tile;
}, ids);

R.forEachObjIndexed((tiles, color) => {
  let file = `./src/data/tiles/${color}.json`;
  console.log(`Writing: ${file}`);
  fs.writeFileSync(path.resolve(file),
                   JSON.stringify(tiles, null, 2));
}, colors);
