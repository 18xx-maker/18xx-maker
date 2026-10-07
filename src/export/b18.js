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
  prop,
  propEq,
  reject,
  sortWith,
  tail,
  toUpper,
  uniq,
} from "ramda";

import * as gutil from "../util/index.js";
import { getMapData, squashRatio } from "../util/map.js";
import { getMarketData } from "../util/market.js";
import { gatherTileColors } from "../util/tiles/tiles.js";
import { b18Names } from "./names.js";

const capitalize = compose(join(""), juxt([compose(toUpper, head), tail]));

// The Board 18 images of a game. Each is captured from the page at one pixel
// per unit (the viewport is the size of the image), in print media. The map
// and the market are always on white (background), the tokens and tiles
// always transparent, whatever the background option says.
export const b18Images = (game, config, data, { slug, variation = 0 } = {}) => {
  const image = (kind, route, basename, width, height, background) => ({
    id: `b18/${basename}`,
    kind,
    route: `/games/${slug}/${route}`,
    query: { print: "true" },
    mode: "item",
    formats: ["b18"],
    size: null,
    paper: null,
    capture: { selector: null, viewport: { w: width, h: height }, background },
    basename,
  });

  const images = [];

  if (game.map) {
    const mapData = getMapData(game, config.coords, 100, variation);
    const width =
      Math.ceil(mapData.b18TotalWidth) +
      (mapData.horizontal && mapData.a1Valid === false ? 87 : 0);
    const doc = image(
      "b18-map",
      "b18/map",
      "Map",
      width,
      Math.ceil(mapData.b18TotalHeight),
      true,
    );
    // Only a map with variations needs to say which
    if (Array.isArray(game.map)) doc.query = { variation, print: "true" };
    images.push(doc);
  }

  if (game.stock) {
    const marketData = getMarketData(game.stock, config);
    // The page is the market page, there is no b18 version of it
    images.push(
      image(
        "b18-market",
        "market",
        "Market",
        Math.ceil((marketData.totalWidth + 50) * 0.96) + 1,
        Math.ceil((marketData.totalHeight + 50) * 0.96) + 1,
        true,
      ),
    );
  }

  // Tokens: 30 pixels for each company and extra token ("quantity" of 0
  // removes a token)
  const extras = reject(propEq(0, "quantity"), game.tokens || []);
  images.push(
    image(
      "b18-tokens",
      "b18/tokens",
      "Tokens",
      60,
      30 * ((game.companies || []).length + extras.length),
      false,
    ),
  );

  // Tiles: one image for each color, sorted by the order of the colors
  const counts = tileCounts(game, data);
  for (const color of keys(counts)) {
    images.push(
      image(
        "b18-tiles",
        `b18/tiles/${encodeURIComponent(color)}`,
        capitalize(color.replace("/", "_")),
        counts[color] * 150,
        900,
        false,
      ),
    );
  }

  return images;
};

// How many different tiles of each color a game has, in the order of the colors
const tileCounts = (game, data) => {
  const tileColors = gatherTileColors(data.tiles);
  const colorSort = compose(
    tileColors.indexOf.bind(tileColors),
    prop("color"),
    defaultTo({ color: "other" }),
  );

  return compose(
    countBy(identity),
    map(prop("color")),
    sortWith([ascend(colorSort)]),
    uniq,
    map(gutil.getTile(data.tiles, game.tiles || {})),
  )(keys(game.tiles));
};

// The Board 18 box of a game: the json file and the images to capture.
// id is the game's id, which Board 18 uses in the names inside the box.
export const b18Spec = (
  game,
  config,
  data,
  { id, version, author, slug = id, variation = 0 },
) => {
  const names = b18Names(id, version);
  const getTile = gutil.getTile(data.tiles, game.tiles || {});
  const images = b18Images(game, config, data, { slug, variation }).map(
    (doc) => ({ ...doc, path: names.image(doc.basename) }),
  );

  const json = {
    bname: id,
    version,
    author,
  };

  // Test games:
  // 1861: Horizontal with valid A1
  // 1858: Horizontal with invalid A1
  // 1871BC: Veritcal with valid A1
  // 18LA: Veritical with invalid A1
  if (game.map) {
    const mapData = getMapData(game, config.coords, 100, variation);
    json.board = {
      imgLoc: names.imgLoc("Map"),
      xStart:
        (mapData.horizontal ? 50 : mapData.a1Valid === false ? 0 : 50) -
        // The image is squashed by the rows, which are across when horizontal
        mapData.trimShift.x * (mapData.horizontal ? squashRatio : 1),
      orientation: mapData.horizontal ? "F" : "P",
      xStep: mapData.horizontal ? 87 : 50,
      yStart: 50 - mapData.trimShift.y * (mapData.horizontal ? 1 : squashRatio),
      yStep: mapData.horizontal ? 50 : 87,
    };
  }

  if (game.stock) {
    json.market = {
      imgLoc: names.imgLoc("Market"),
      xStart: 25 * 0.96,
      xStep: config.stock.cell.width * 0.96,
      yStart: (game.stock.title === false ? 25 : 75) * 0.96,
      yStep:
        (game.stock.type === "2D"
          ? config.stock.cell.height
          : game.stock.type === "1Diag"
            ? (config.stock.cell.height * config.stock.column) / 2
            : config.stock.cell.height * config.stock.column) * 0.96,
    };
  }

  json.tray = [];
  json.links = [];

  if (game.links) {
    if (game.links.bgg) {
      json.links.push({
        link_name: `${id} on BGG`,
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

  // Tile Trays
  const colors = keys(tileCounts(game, data));

  for (const color of colors) {
    const tray = {
      type: "tile",
      tName: `${capitalize(color)} Tiles`,
      imgLoc: names.imgLoc(capitalize(color.replace("/", "_"))),
      xStart: 24,
      yStart: 24,
      xStep: 150,
      yStep: 150,
      xSize: game.info.orientation === "horizontal" ? 116 : 100,
      ySize: game.info.orientation === "horizontal" ? 100 : 116,
      tile: [],
    };

    mapObjIndexed((dups, tileId) => {
      let tile = getTile(tileId);
      if (tile.color !== color) return;

      // Merge tile with game tile
      if (is(Object, game.tiles[tileId])) {
        tile = { ...tile, ...game.tiles[tileId] };
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
  const btok = {
    type: "btok",
    tName: "Tokens",
    imgLoc: names.imgLoc("Tokens"),
    xStart: 0,
    xSize: 30,
    xStep: 30,
    yStart: 0,
    ySize: 30,
    yStep: 30,
    token: [],
  };
  const mtok = { ...btok, type: "mtok", token: [] };

  for (const company of gutil.compileCompanies(game) || []) {
    btok.token.push({
      dups: company.tokens.length + (game.info.extraStationTokens || 0),
      flip: true,
    });
    mtok.token.push({
      flip: true,
    });
  }

  // "quantity" of 0 mean remove the token entirely from the array
  // "quantity of "∞" means we put the special value of 0 in for dups
  // otherwise, "quantity" is the number of dups
  for (const extra of reject(propEq(0, "quantity"), game.tokens || [])) {
    btok.token.push({
      dups: extra.quantity === "∞" ? 0 : extra.quantity || 1,
      flip: true,
    });
  }

  json.tray.push(btok);
  json.tray.push(mtok);

  return { names, json, images };
};
