import { createWriteStream, writeFileSync } from "node:fs";

import archiver from "archiver";
import { chromium } from "playwright";

import {
  ascend,
  compose,
  countBy,
  defaultTo,
  head,
  identity,
  is,
  join,
  juxt,
  keys,
  map,
  mapObjIndexed,
  mergeDeepRight,
  prop,
  propEq,
  reject,
  sortWith,
  tail,
  toUpper,
  uniq,
} from "ramda";

import {
  customConfig,
  defaultConfig,
  loadGame,
  loadTiles,
  setup,
  setupB18,
  startExpress,
} from "#cli/util";
import * as gutil from "#util/index";
import { getMapData } from "#util/map";
import { getMarketData } from "#util/market";
import { compileTiles, gatherTileColors } from "#util/tiles";

const tiles = compileTiles(...loadTiles());
const tileColors = gatherTileColors(tiles);
const config = mergeDeepRight(defaultConfig, customConfig);
const capitalize = compose(join(""), juxt([compose(toUpper, head), tail]));
const colorSort = compose(
  tileColors.indexOf.bind(tileColors),
  prop("color"),
  defaultTo({ color: "other" }),
);
const sortTiles = sortWith([ascend(colorSort)]);

const command = async (bname, version, author, opts) => {
  setup();

  const server = startExpress();

  if (opts.debug) {
    console.log("Debug Mode");
    console.log("Starting the express server on http://localhost:9000");
    console.log("\nCtrl-C when done");
    return;
  }

  let game = loadGame(bname);
  let id = `${bname}-${version}`;
  let folder = `board18-${id}`;

  let mapData = getMapData(game, config.coords, 100, 0);

  const getTile = gutil.getTile(tiles, game.tiles || {});

  // Test games:
  // 1861: Horizontal with valid A1
  // 1858: Horizontal with invalid A1
  // 1871BC: Veritcal with valid A1
  // 18LA: Veritical with invalid A1

  let json = {
    bname,
    version,
    author,
    board: {
      imgLoc: `images/${id}/Map.png`,
      xStart: mapData.horizontal ? 50 : mapData.a1Valid === false ? 0 : 50,
      orientation: mapData.horizontal ? "F" : "P",
      xStep: mapData.horizontal ? 87 : 50,
      yStart: 50,
      yStep: mapData.horizontal ? 50 : 87,
    },
    market: {
      imgLoc: `images/${id}/Market.png`,
      xStart: 25 * 0.96,
      xStep: config.stock.cell.width * 0.96,
      yStart: (game.stock.title === false ? 25 : 75) * 0.96,
      yStep:
        (game.stock.type === "2D"
          ? config.stock.cell.height
          : game.stock.type === "1Diag"
            ? (config.stock.cell.height * config.stock.column) / 2
            : config.stock.cell.height * config.stock.column) * 0.96,
    },
    tray: [],
    links: [],
  };

  if (game.links) {
    if (game.links.bgg) {
      json.links.push({
        link_name: `${bname} on BGG`,
        link_url: game.links.bgg,
      });
    }
    if (game.links.rules) {
      json.links.push({
        link_name: `Rules`,
        link_url: game.links.rules,
      });
    }
  }

  setupB18(bname, version);
  let counts = compose(
    countBy(identity),
    map(prop("color")),
    sortTiles,
    uniq,
    map(getTile),
  )(keys(game.tiles));
  let colors = keys(counts);

  // Tile Trays
  for (let j = 0; j < colors.length; j++) {
    let color = colors[j];
    let color_filename = color.replace("/", "_");

    let tray = {
      type: "tile",
      tName: `${capitalize(color)} Tiles`,
      imgLoc: `images/${id}/${capitalize(color_filename)}.png`,
      xStart: 24,
      yStart: 24,
      xStep: 150,
      yStep: 150,
      xSize: game.info.orientation === "horizontal" ? 116 : 100,
      ySize: game.info.orientation === "horizontal" ? 100 : 116,
      tile: [],
    };

    mapObjIndexed((dups, id) => {
      let tile = getTile(id);
      if (tile.color !== color) return;

      // Merge tile with game tile
      if (is(Object, game.tiles[id])) {
        tile = { ...tile, ...game.tiles[id] };
      }

      // Figure out rotations
      let rots = 6;
      if (is(Number, tile.rotations)) {
        rots = tile.rotations;
      } else if (is(Array, tile.rotations)) {
        rots = tile.rotations.length;
      }

      tray.tile.push({
        rots,
        dups: tile.quantity === "∞" ? 0 : tile.quantity,
      });
    }, game.tiles);

    json.tray.push(tray);
  }

  // Token Trays
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
    token: [],
  };
  let mtok = { ...btok, type: "mtok", token: [] };

  map(
    (company) => {
      btok.token.push({
        dups: company.tokens.length + (game.info.extraStationTokens || 0),
        flip: true,
      });
      mtok.token.push({
        flip: true,
      });
    },
    gutil.compileCompanies(game) || [],
  );

  // "quantity" of 0 mean remove the token entirely from the array
  // "quantity of "∞" means we put the special value of 0 in for dups
  // otherwise, "quantity" is the number of dups
  let tokens = compose(
    map((extra) => {
      btok.token.push({
        dups: extra.quantity === "∞" ? 0 : extra.quantity || 1,
        flip: true,
      });
    }),
    reject(propEq(0, "quantity")),
  )(game.tokens || []);
  let tokenHeight = 30 * ((game.companies || []).length + tokens.length);

  json.tray.push(btok);
  json.tray.push(mtok);

  // Output main JSON file
  console.log(`Writing  ${bname}/${folder}/${id}.json`);
  writeFileSync(
    `render/${bname}/${folder}/${id}.json`,
    JSON.stringify(json, null, 2),
  );

  // Open browser and create takeScreenshot function
  const browser = await chromium.launch({
    args: ["--force-color-profile srgb"],
  });
  const page = await browser.newPage();
  const takeScreenshot = async (
    urlPath,
    width,
    height,
    filename,
    omitBackground = false,
  ) => {
    console.log(`Printing ${bname}/${folder}/${id}/${filename}.png`);
    await page.goto(
      `http://localhost:9000/games/${bname}/${urlPath}?print=true`,
      {
        waitUntil: "networkidle",
      },
    );
    await page.setViewportSize({ width, height });
    await page.screenshot({
      path: `render/${bname}/${folder}/${id}/${filename}.png`,
      omitBackground,
    });
  };

  // Map
  let mapWidth =
    Math.ceil(mapData.b18TotalWidth) +
    (mapData.horizontal && mapData.a1Valid === false ? 87 : 0);
  let mapHeight = Math.ceil(mapData.b18TotalHeight);
  await takeScreenshot("b18/map", mapWidth, mapHeight, "Map");

  // Market
  let marketData = getMarketData(game.stock, config);
  let marketWidth = Math.ceil((marketData.totalWidth + 50) * 0.96) + 1;
  let marketHeight = Math.ceil((marketData.totalHeight + 50) * 0.96) + 1;
  await takeScreenshot("market", marketWidth, marketHeight, "Market");

  // Tokens
  await takeScreenshot("b18/tokens", 60, tokenHeight, "Tokens", true);

  // Tiles
  for (let j = 0; j < colors.length; j++) {
    let color = colors[j];
    let color_filename = color.replace("/", "_");

    let width = counts[color] * 150;
    let height = 900;

    await takeScreenshot(
      `b18/tiles/${color}`,
      width,
      height,
      capitalize(color_filename),
      true,
    );
  }

  // Close out our services
  await browser.close();
  await server.close();

  // Output zip file
  console.log(`Creating ${bname}/${folder}.zip`);
  const output = createWriteStream(`render/${bname}/${folder}.zip`);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });
  archive.pipe(output);
  archive.directory(`render/${bname}/${folder}`, `${folder}`);
  archive.finalize();
};
export default command;
