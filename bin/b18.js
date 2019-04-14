const fs = require('fs');
const R = require('ramda');
const path = require('path');

require("@babel/register");

const util = require('../src/render/util');
const setup = util.setup;
const setupB18 = util.setupB18;

const capitalize = R.compose(
    R.join(''),
    R.juxt([R.compose(R.toUpper, R.head), R.tail])
);

setup();

let bname = process.argv[2];
let version = process.argv[3];
let author = process.argv[4];

let game = require(`../src/data/games/${bname}`).default;
let tiles = require('../src/data/tiles').default;

const getTile = id => {
  if(!tiles[id]) {
    id = id.split("|")[0];
  }

  let tile = tiles[id];
  tile.id = id;
  return tile;
};

let json = {
  bname,
  version,
  author,
  board: {
    imgLoc: "map.png",
    xStart: 50,
    xStep: 50,
    yStart: 58,
    yStep: 87
  },
  market: {
    imgLoc: "market.png",
    xStart: 50,
    xStep: 50,
    yStart: 58,
    yStep: 87
  },
  tray: [],
  links: [{
    link_name: `${bname} on BGG`,
    link_url: game.links.bgg
  },{
    link_name: `Rules`,
    link_url: game.links.rules
  }]
};

setupB18(bname);
let counts = R.compose(
  R.countBy(R.identity),
  R.map(R.prop("color")),
  R.uniq,
  R.map(id => tiles[id] || tiles[id.split("|")[0]])
)(R.keys(game.tiles));
let colors = R.keys(counts);

for(let j=0;j<colors.length;j++) {
  let color = colors[j];

  let tray = {
    type: "tile",
    tName: `${capitalize(color)} Tiles`,
    xStart: 0,
    yStart: 0,
    xStep: 150,
    yStep: 150,
    xSize: game.info.orientation === "horizontal" ? 116 : 100,
    ySize: game.info.orientation === "horizontal" ? 100 : 116,
    tile: []
  };

  let tiles = R.compose(R.uniq,
                        R.filter(R.propEq("color", color)),
                        R.map(getTile))(R.keys(game.tiles));

  R.mapObjIndexed((dups, id) => {
    let tile = getTile(id);
    if (tile.color !== color) return;

    // Merge tile with game tile
    if(R.is(Object,game.tiles[id])) {
      tile = {...tile, ...game.tiles[id]};
    }

    // Figure out rotations
    let rots = 6;
    if(R.is(Number, tile.rotations)) {
      rots = tile.rotations;
    } else if(R.is(Array, tile.rotations)) {
      rots = tile.rotations.length;
    }

    tray.tile.push({
      rots,
      dups
    });
  }, game.tiles);

  json.tray.push(tray);
}

console.log(JSON.stringify(json, null, 2));
