import assoc from "ramda/src/assoc";
import chain from "ramda/src/chain";
import compose from "ramda/src/compose";
import concat from "ramda/src/concat";
import curry from "ramda/src/curry";
import equals from "ramda/src/equals";
import filter from "ramda/src/filter";
import find from "ramda/src/find";
import indexOf from "ramda/src/indexOf";
import map from "ramda/src/map";
import max from "ramda/src/max";
import mergeDeepWithKey from "ramda/src/mergeDeepWithKey";
import min from "ramda/src/min";
import nth from "ramda/src/nth";
import prop from "ramda/src/prop";
import reduce from "ramda/src/reduce";
import splitEvery from "ramda/src/splitEvery";
import zipWith from "ramda/src/zipWith";

export const HEX_RATIO = 0.57735;
export const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Get amount of space needed for coordinates
export const getCoordSpace = coords => {
  switch(coords) {
  case "outside":
    return 100;
  case "edge":
    return 50;
  default:
    return 0;
  }
};

// How much should we offset map positioning based on our coordinate choice?
export const getCoordOffset = coords => {
  switch(coords) {
  case "outside":
    return 50;
  case "edge":
    return 25;
  default:
    return 0;
  }
};

// Convert a number to it's alpha coordinate
export const toAlpha = num => {
  if (num <= 0) {
    return "";
  } else if (num <= alpha.length) {
    return nth(num - 1, alpha);
  } else {
    let remainder = num % alpha.length;
    if(remainder === 0) {
      remainder = alpha.length;
    }
    let quotient = Math.floor((num - 1) / alpha.length);
    return `${toAlpha(quotient)}${toAlpha(remainder)}`;
  }
};

// Convert an alpha coordinate to a number
export const alphaToInt = compose(
  reduce((total, c) => {
    return total * alpha.length + (indexOf(c, alpha) + 1);
  }, 0),
  splitEvery(1)
);

// Regexp to find coordinates
export const coordsRegExp = /([a-z]+)([0-9]+)/i;

export const toCoords = str => {
  if(Array.isArray(str)) {
    return str;
  }

  let match = coordsRegExp.exec(str);
  if (match) {
    let y = alphaToInt(match[1]);
    let x = parseInt(match[2], 10);
    return [x, y];
  } else {
    return null;
  }
};

export const maxMapX = compose(
  reduce(max, 1), // Find the max
  map(nth(0)), // Grab the X coordinate
  map(toCoords), // Convert to coordinate arrays
  chain(prop("hexes")) // Grab all hexes
);

export const maxMapY = compose(
  reduce(max, 1), // Find the max
  map(nth(1)), // Grab the Y coordinate
  map(toCoords), // Convert to coordinate arrays
  chain(prop("hexes")) // Grab all hexes
);

export const getTotalWidth = (maxX, hexWidth, extraWidth, coordSpace) =>
  ((extraWidth || 0) * hexWidth / 150.0) +
  coordSpace +
  0.5 * hexWidth * (maxX + 1);

export const getTotalHeight = (maxY, hexWidth, extraHeight, coordSpace) =>
  ((extraHeight || 0) * hexWidth / 150.0) +
  coordSpace +
  (1.5 * (maxY - 1) * (HEX_RATIO * hexWidth) + 2 * (HEX_RATIO * hexWidth));

const hexesToCoords = compose(map(toCoords), chain(prop("hexes")));

export const mergeHex = (a, b) => {
  // First check if we need to merge deep!
  return mergeDeepWithKey((key, da, db) => {
    if (Array.isArray(da)) {
      if(key === "track" || key === "offBoardTrack") {
        // Concat tracks
        return concat(da, db);
      } else if(key === "companies" || key === "hexes" || key === "removeBorders") {
        // New companies and hexes only
        return da;
      } else {
        return zipWith(mergeHex, da, db);
      }
    } else {
      return da;
    }
  }, a, b);
};

const resolveHex = curry((hexes, hex) => {
  if (hex.copy) {
    // Find copy
    let copyHex = find(h => indexOf(hex.copy, h.hexes) > -1, hexes);

    if (copyHex) {
      let merged = mergeHex(hex, resolveHex(hexes, copyHex));

      delete merged.copy;

      return merged;
    }
  }

  // Nothing to copy
  return hex;
});

const topCoord = curry((hexes, hexWidth, x) => {
  let coords = hexesToCoords(hexes);
  let filtered = filter(c => c[0] === x, coords);
  let maxHex = reduce((m,x) => min(m, nth(1,x)), 1000, filtered);

  let extra = 0;
  let hexesAbove = filter(c => equals(c, [x - 1, maxHex - 1]) || equals(c, [x + 1, maxHex - 1]),
                          coords);
  if(hexesAbove.length > 0) {
    extra = hexWidth * HEX_RATIO;
  }

  let y = (x % 2 === 0 ? 10 : 8) + (1.5 * hexWidth * HEX_RATIO * (maxHex - 1)) - extra;
  return y;
});

const bottomCoord = curry((hexes, hexWidth, x) => {
  let coords = hexesToCoords(hexes);
  let filtered = filter(c => c[0] === x, coords);
  let maxHex = reduce((m,x) => max(m, nth(1,x)), 1, filtered);

  let extra = 0;
  let hexesAbove = filter(c => equals(c, [x - 1, maxHex + 1]) || equals(c, [x + 1, maxHex + 1]),
                          coords);
  if(hexesAbove.length > 0) {
    extra = hexWidth * HEX_RATIO;
  }

  let y = (x % 2 === 0 ? -48 : -46) + (1.5 * hexWidth * HEX_RATIO * (maxHex + 1)) + extra;
  return y;
});

const leftCoord = curry((hexes, hexWidth, y) => {
  let filtered = filter(c => c[1] === y, hexesToCoords(hexes));
  let maxHex = reduce((m,x) => min(m, nth(0,x)), 1000, filtered);
  let x = 10 + (hexWidth * 0.5 * (maxHex - 1));
  return x;
});

const rightCoord = curry((hexes, hexWidth, y) => {
  let filtered = filter(c => c[1] === y, hexesToCoords(hexes));
  let maxHex = reduce((m,x) => max(m, nth(0,x)), 1, filtered);
  let x = 40 + (hexWidth * 0.5 * (maxHex + 1));
  return x;
});

export const getMapData = (game, coords, hexWidth, variation) => {
  variation = variation || 0;

  let scale = hexWidth / 150.0;

  // Get the relevant map
  let gameMap = Array.isArray(game.map) ? game.map[variation] : game.map;

  // If the game is map-less, just return an empty object
  if (!gameMap) {
    return {};
  }

  let coordSpace = getCoordSpace(coords);
  let coordOffset = getCoordOffset(coords);

  // Get some constants;
  let edge = hexWidth * HEX_RATIO;
  let halfHexWidth = 0.5 * hexWidth;

  let hexX = (x, y) => {
    return (x * halfHexWidth) + coordOffset;
  };

  let hexY = (x, y) => {
    return ((y - 1) * 1.5 * edge + edge) + coordOffset;
  };

  // Find all hexes
  let hexes = map(assoc("variation", variation), gameMap.hexes || []);
  if (gameMap.copy !== undefined) {
    hexes = concat(
      map(assoc("variation", gameMap.copy), game.map[gameMap.copy].hexes),
      hexes
    );
  }
  hexes = map(resolveHex(hexes), hexes);

  let maxX = maxMapX(hexes);
  let maxY = maxMapY(hexes);

  let totalWidth = getTotalWidth(maxX, hexWidth, game.info.extraTotalWidth, coordSpace);
  let totalHeight = getTotalHeight(maxY, hexWidth, game.info.extraTotalHeight, coordSpace);
  let printWidth = `${(50 + totalWidth) / 100.0}in`;
  let printHeight = `${(50 + totalHeight) / 100.0}in`;

  let horizontal = game.info.orientation === "horizontal";

  return {
    // Is this map in horizontal layout?
    horizontal,

    // Hex width flat to flat
    hexWidth,
    scale,

    // Coords choice
    coords,

    // How much space and offset to use due to coordinate choice
    coordSpace,
    coordOffset,

    // Biggest coords
    maxX: horizontal ? maxY : maxX,
    maxY: horizontal ? maxX : maxY,

    // Total height and width in svg units
    totalWidth: horizontal ? totalHeight : totalWidth,
    totalHeight: horizontal ? totalWidth : totalHeight,

    // Print height and width in CSS units
    printWidth: horizontal ? printHeight : printWidth,
    printHeight: horizontal ? printWidth : printHeight,

    // Function to computer coordinates of a hex
    hexX: horizontal ? hexY : hexX,
    hexY: horizontal ? hexX : hexY,

    // Where to place coordinates
    topCoord: horizontal ? leftCoord(hexes, hexWidth) : topCoord(hexes, hexWidth),
    leftCoord: horizontal ? topCoord(hexes, hexWidth) : leftCoord(hexes, hexWidth),
    bottomCoord: horizontal ? rightCoord(hexes, hexWidth) : bottomCoord(hexes, hexWidth),
    rightCoord: horizontal ? bottomCoord(hexes, hexWidth) : rightCoord(hexes, hexWidth),

    // The resolved map variation
    map: gameMap,

    // The resolved hexes
    hexes: hexes
  };
};
