require("@babel/register");

const R = require('ramda');
const express = require('express');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const sharp = require('sharp');
const archiver = require('archiver');

const { getMapData } = require("../src/map/util");
const gutil = require('../src/util').default;
const util = require('../src/render/util');
const setup = util.setup;
const setupB18 = util.setupB18;

const config = require('../src/config.json');
const mutil = require('../src/market-utils');

const capitalize = R.compose(
  R.join(''),
  R.juxt([R.compose(R.toUpper, R.head), R.tail])
);

setup();

// Startup server
const app = express();

app.use(express.static(path.join(process.cwd(), 'build')));

app.get('/*', function(req, res) {
  res.sendFile(path.join(process.cwd(), 'build', 'index.html'));
});

const server = app.listen(9000);

(async () => {
  if (process.argv[2] === "debug") return;

  let bname = process.argv[2];
  let version = process.argv[3];
  let id = `${bname}-${version}`;
  let folder = `board18-${id}`;
  let author = process.argv[4];

  let game = require(`../src/data/games/${bname}`);
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
      imgLoc: `images/${id}/Map.png`,
      xStart: game.info.orientation === "horizontal" ? 47 : 50,
      xStep: game.info.orientation === "horizontal" ? 87 : 50,
      yStart: game.info.orientation === "horizontal" ? 0 : 47,
      yStep: game.info.orientation === "horizontal" ? 50 : 87
    },
    market: {
      imgLoc: `images/${id}/Market.png`,
      xStart: 25,
      xStep: config.stock.cell.width,
      yStart: 75,
      yStep: config.stock.cell.height
    },
    tray: [],
    links: []
  };

  if (game.links) {
    if (game.links.bgg) {
      json.links.push({
        link_name: `${bname} on BGG`,
        link_url: game.links.bgg
      });
    }
    if (game.links.rules) {
      json.links.push({
        link_name: `Rules`,
        link_url: game.links.rules
      });
    }
  }

  setupB18(bname, version);
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
      imgLoc: `images/${id}/${capitalize(color)}.png`,
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

  // Tile Trays
  let btok = {
    type: "btok",
    tName: "Tokens",
    imgLoc: `images/${id}/Tokens.png`,
    xStart: 0,
    xSize: 30,
    xStep: 30,
    yStart: 0,
    ySize: 30,
    yStep: 30,
    token: []
  };
  let mtok = {...btok, type: "mtok", token: []};

  R.map(company => {
    btok.token.push({
      dups:(company.tokens.length + (game.info.extraHomeTokens || 0)),
      flip:true
    });
    mtok.token.push({
      flip:true
    });
  }, game.companies || []);

  R.map(extra => {
    btok.token.push({
      dups: 1,
      flip: true
    });
  }, game.tokens || []);

  json.tray.push(btok);
  json.tray.push(mtok);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.emulateMedia('print');

  let mapData = getMapData(game, config.coords, 100, 0);
  let printWidth = Math.ceil(mapData.totalWidth);
  let printHeight = Math.ceil(mapData.totalHeight);

  console.log(`Printing ${bname}/${folder}/${id}/Map.png`);
  await page.goto(`http://localhost:9000/${bname}/b18-map`, {waitUntil: 'networkidle2'});
  await page.setViewport({ width: printWidth, height: printHeight });
  await page.screenshot({ path: `build/render/${bname}/${folder}/${id}/Map.png`});

  console.log(`Printing ${bname}/${folder}/${id}/Market.png`);
  let marketWidth = (config.stock.cell.width + 1) * mutil.width(game.stock.market);
  let marketHeight = 50 + ((config.stock.cell.height + 1) * mutil.height(game.stock.market));
  await page.goto(`http://localhost:9000/${bname}/market`, {waitUntil: 'networkidle2'});
  await page.addStyleTag({ content: '.stock {margin: 0.25in !important;}'});
  await page.setViewport({ width: marketWidth + 1, height: marketHeight + 1 });
  await page.screenshot({ path: `build/render/${bname}/${folder}/${id}/Market.png`});

  console.log(`Printing ${bname}/${folder}/${id}/Tokens.png`);
  let tokenHeight = 30 * ((game.companies || []).length +
                          (game.tokens || []).length);
  await page.goto(`http://localhost:9000/${bname}/b18-tokens`, {waitUntil: 'networkidle2'});
  await page.setViewport({ width: 60, height: tokenHeight });
  await page.screenshot({ path: `build/render/${bname}/${folder}/${id}/Tokens.png`, omitBackground: true });

  // Board18 Tiles
  for(let j=0;j<colors.length;j++) {
    let color = colors[j];

    let width = counts[color] * 150;
    let height = 900;

    console.log(`Printing ${bname}/${folder}/${id}/${capitalize(color)}.png`);
    await page.goto(`http://localhost:9000/${bname}/b18-tiles-${color}`, {waitUntil: 'networkidle2'});
    await page.setViewport({ width, height });
    await page.screenshot({ path: `build/render/${bname}/${folder}/${id}/${capitalize(color)}.png`, omitBackground: true });
  }
  await browser.close();

  await server.close();

  console.log(`Writing  ${bname}/${folder}/${id}.json`);
  fs.writeFileSync(`build/render/${bname}/${folder}/${id}.json`, JSON.stringify(json, null, 2));

  console.log(`Creating ${bname}/${folder}.zip`);

  const output = fs.createWriteStream(`build/render/${bname}/${folder}.zip`);
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });
  archive.pipe(output);
  archive.directory(`build/render/${bname}/${folder}`, `${folder}`);
  archive.finalize();
})();
