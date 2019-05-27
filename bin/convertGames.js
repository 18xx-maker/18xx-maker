#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const R = require('ramda');

require("@babel/register");

const games = require("../src/data/games").default;

R.forEachObjIndexed((game, name) => {
  let file = `./src/data/games/${name}.json`;
  console.log(`Writing: ${file}`);
  fs.writeFileSync(path.resolve(file),
                   JSON.stringify(game, null, 2));
}, games);
