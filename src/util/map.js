import {
  assoc,
  chain,
  compose,
  concat,
  curry,
  filter,
  find,
  indexOf,
  map,
  max,
  mergeDeepWithKey,
  min,
  nth,
  prop,
  reduce,
  reject,
  splitEvery,
  without,
  zipWith,
} from "ramda";

export const HEX_RATIO = 0.57735;
export const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const radians = (degrees) => degrees * (Math.PI / 180);

// Get amount of space needed for coordinates
export const getCoordSpace = (coords) => {
  switch (coords) {
    case "outside":
      return 100;
    case "edge":
      return 50;
    default:
      return 0;
  }
};

// How much should we offset map positioning based on our coordinate choice?
export const getCoordOffset = (coords) => {
  switch (coords) {
    case "outside":
      return 50;
    case "edge":
      return 25;
    default:
      return 0;
  }
};

// Convert a number to it's alpha coordinate
export const toAlpha = (num) => {
  if (num <= 0) {
    return "";
  } else if (num <= alpha.length) {
    return nth(num - 1, alpha);
  } else {
    let remainder = num % alpha.length;
    if (remainder === 0) {
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
  splitEvery(1),
);

// Regexp to find coordinates
export const coordsRegExp = /([a-z]+)([0-9]+)/i;

export const toCoords = (str) => {
  if (Array.isArray(str)) {
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
  chain(prop("hexes")), // Grab all hexes
);

export const maxMapY = compose(
  reduce(max, 1), // Find the max
  map(nth(1)), // Grab the Y coordinate
  map(toCoords), // Convert to coordinate arrays
  chain(prop("hexes")), // Grab all hexes
);

export const getTotalWidth = (maxX, hexWidth, extraWidth, coordSpace) =>
  ((extraWidth || 0) * hexWidth) / 150.0 +
  coordSpace +
  0.5 * hexWidth * (maxX + 1);

export const getTotalHeight = (maxY, hexWidth, extraHeight, coordSpace) =>
  ((extraHeight || 0) * hexWidth) / 150.0 +
  coordSpace +
  (1.5 * (maxY - 1) * (HEX_RATIO * hexWidth) + 2 * (HEX_RATIO * hexWidth));

const hexesToCoords = compose(map(toCoords), chain(prop("hexes")));

export const mergeHex = (a, b) => {
  // First check if we need to merge deep!
  return mergeDeepWithKey(
    (key, da, db) => {
      if (Array.isArray(da)) {
        if (key === "track" || key === "offBoardTrack") {
          // Concat tracks
          return concat(da, db);
        } else if (
          key === "companies" ||
          key === "hexes" ||
          key === "removeBorders"
        ) {
          // New companies and hexes only
          return da;
        } else {
          return zipWith(mergeHex, da, db);
        }
      } else {
        return da;
      }
    },
    a,
    b,
  );
};

const resolveHex = curry((hexes, hex) => {
  if (hex.copy) {
    // Find copy
    let copyHex = find((h) => indexOf(hex.copy, h.hexes) > -1, hexes);

    if (copyHex) {
      let merged = mergeHex(hex, resolveHex(hexes, copyHex));

      delete merged.copy;

      return merged;
    }
  }

  // Nothing to copy
  return hex;
});

// shift: how far the hexes moved up, as the top edge of the map is trimmed. The
// labels move with them but stay in the margin.
const topCoord = curry((hexes, hexWidth, shift, x) => {
  let coords = hexesToCoords(hexes);
  let filtered = filter((c) => c[0] === x, coords);
  let minHex = reduce((m, x) => min(m, nth(1, x)), 1000, filtered);

  let allHexesNext = filter((c) => c[0] === x - 1 || c[0] === x + 1, coords);
  let minHexNext = reduce((m, x) => min(m, nth(1, x)), 1000, allHexesNext);

  let extra = 0;
  if (minHex - minHexNext > 0) {
    extra =
      (minHex - minHexNext - 1) * 1.5 * hexWidth * HEX_RATIO +
      hexWidth * HEX_RATIO;
  }

  let base = x % 2 === 0 ? 10 : 8;
  let y = base + 1.5 * hexWidth * HEX_RATIO * (minHex - 1) - extra - shift;
  return shift === 0 ? y : Math.max(y, base);
});

// shift: how far the hexes moved up. limit: the bottom of the page when the map
// is trimmed (at the top or the bottom), so a label stays on the page.
const bottomCoord = curry((hexes, hexWidth, shift, limit, x) => {
  let coords = hexesToCoords(hexes);
  let filtered = filter((c) => c[0] === x, coords);
  let maxHex = reduce((m, x) => max(m, nth(1, x)), 1, filtered);

  let allHexesNext = filter((c) => c[0] === x - 1 || c[0] === x + 1, coords);
  let maxHexNext = reduce((m, x) => max(m, nth(1, x)), 1, allHexesNext);

  let extra = 0;
  if (maxHexNext - maxHex > 0) {
    extra =
      (maxHexNext - maxHex - 1) * 1.5 * hexWidth * HEX_RATIO +
      hexWidth * HEX_RATIO;
  }

  let y =
    (x % 2 === 0 ? -48 : -46) +
    1.5 * hexWidth * HEX_RATIO * (maxHex + 1) +
    extra -
    shift;
  return limit === undefined ? y : Math.min(y, limit - 10);
});

const leftCoord = curry((hexes, hexWidth, shift, y) => {
  let filtered = filter((c) => c[1] === y, hexesToCoords(hexes));
  let maxHex = reduce((m, x) => min(m, nth(0, x)), 1000, filtered);
  const x = 10 + hexWidth * 0.5 * (maxHex - 1) - shift;
  return shift === 0 ? x : Math.max(x, 10);
});

const rightCoord = curry((hexes, hexWidth, shift, limit, y) => {
  let filtered = filter((c) => c[1] === y, hexesToCoords(hexes));
  let maxHex = reduce((m, x) => max(m, nth(0, x)), 1, filtered);
  const x = 40 + hexWidth * 0.5 * (maxHex + 1) - shift;
  return limit === undefined ? x : Math.min(x, limit - 10);
});

// Takes in a string in one of these forms:
// * A1a30p0.4 - Angle 30, percent 0.4 of hex A1
// * A1a30 - Angle 30, percent 1.0 of hex A1
// * A1s1 - Middle of side 1 on the border of hex A1
// * A1p1 - Point 1 on the border of hex A1
// * A1x0y0 - At coordinate (0,0) from the middle of hex A1
const RE_mapCoordxy = /^([A-Z]+[0-9]+)x([0-9.-]+)y([0-9.-]+)$/;
const RE_mapCoordap = /^([A-Z]+[0-9]+)a([0-9.-]+)p([0-9.-]+)$/;
const RE_mapCoorda = /^([A-Z]+[0-9]+)a([0-9.-]+)$/;
const RE_mapCoords = /^([A-Z]+[0-9]+)s([0-9.-]+)$/;
const RE_mapCoordp = /^([A-Z]+[0-9]+)p([0-9.-]+)$/;
// The point `length` from the center of a hex along `direction` degrees. The
// length is stretched by the angle the direction makes with the hex's flat.
const polarCoord = (data, hex, length, angleFromFlat, direction) => {
  let [i, j] = toCoords(hex);
  let x = data.hexX(i, j);
  let y = data.hexY(i, j);

  length = length / Math.cos(radians(angleFromFlat));

  x += length * Math.sin(radians(-direction));
  y += length * Math.cos(radians(-direction));

  return `${x} ${y}`;
};

export const mapCoord = (string, data) => {
  // First attempt x/y coordinates
  let xyTest = string.match(RE_mapCoordxy);

  if (xyTest) {
    let [i, j] = toCoords(xyTest[1]);
    let x = data.hexX(i, j);
    let y = data.hexY(i, j);

    x += Number(xyTest[2]) * data.scale;
    y += Number(xyTest[3]) * data.scale;

    return `${x} ${y}`;
  }

  let apTest = string.match(RE_mapCoordap);

  if (apTest) {
    let angle = Number(apTest[2]);

    return polarCoord(
      data,
      apTest[1],
      Number(apTest[3] * 75) * data.scale,
      (angle % 60) - (data.horizontal ? 0 : 30),
      angle,
    );
  }

  let aTest = string.match(RE_mapCoorda);

  if (aTest) {
    let angle = Number(aTest[2]);

    return polarCoord(
      data,
      aTest[1],
      75 * data.scale,
      (angle % 60) - (data.horizontal ? 0 : 30),
      angle,
    );
  }

  let sTest = string.match(RE_mapCoords);
  if (sTest) {
    let angle = 60 * (sTest[2] - 1) + 90;

    return polarCoord(
      data,
      sTest[1],
      75 * data.scale,
      (angle % 60) - 30,
      angle + (data.horizontal ? -90 : 0),
    );
  }

  let pTest = string.match(RE_mapCoordp);
  if (pTest) {
    let angle = 60 * (pTest[2] - 1);

    return polarCoord(
      data,
      pTest[1],
      75 * data.scale,
      (angle % 60) - 30,
      angle + (data.horizontal ? 90 : 0),
    );
  }

  return string;
};

export const getMapHexes = (game, variation) => {
  variation = variation || 0;

  // Get the relevant map
  let gameMap = Array.isArray(game.map) ? game.map[variation] : game.map;

  // If the game is map-less, just return an empty object
  if (!gameMap) {
    return [];
  }

  let hexes = map(assoc("variation", variation), gameMap.hexes || []);
  if (gameMap.copy !== undefined) {
    hexes = concat(
      map(assoc("variation", gameMap.copy), game.map[gameMap.copy].hexes),
      hexes,
    );
  }
  hexes = map(resolveHex(hexes), hexes);

  return hexes;
};

export const getMapHex = (game, hex, variation) => {
  let hexes = getMapHexes(game, variation);

  return find((h) => h.hexes.includes(hex), hexes);
};

const NO_HALVES = [];

export const squashRatio = 87 / 86.6025;

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

  // Trimmed edges of the map, by the page edge. The rows and columns here are
  // the ones of the coordinates, which a horizontal map turns on the page.
  const horizontal = game.info.orientation === "horizontal";
  // A copied map keeps the trimmed edges of the map it copies, any of them can
  // be set again (to false to put the half back)
  const trim = {
    ...(gameMap.copy !== undefined ? game.map[gameMap.copy].trim : {}),
    ...gameMap.trim,
  };
  const trimmed = {
    top: !!(horizontal ? trim.left : trim.top),
    bottom: !!(horizontal ? trim.right : trim.bottom),
    left: !!(horizontal ? trim.top : trim.left),
    right: !!(horizontal ? trim.bottom : trim.right),
  };
  let hexX = (x) => {
    return x * halfHexWidth + coordOffset - shiftX;
  };

  let hexY = (x, y) => {
    return (y - 1) * 1.5 * edge + edge + coordOffset - shiftY;
  };

  // Find all hexes
  let hexes = map(assoc("variation", variation), gameMap.hexes || []);
  let borders = gameMap.borders || [];
  let borderTexts = gameMap.borderTexts || [];
  let lines = gameMap.lines || [];
  if (gameMap.copy !== undefined) {
    hexes = concat(
      map(assoc("variation", gameMap.copy), game.map[gameMap.copy].hexes),
      hexes,
    );

    // Remove any hexes set to be removed
    if (gameMap.remove !== undefined) {
      hexes = map((hex) => {
        return assoc(
          "hexes",
          reject((coord) => (gameMap.remove || []).includes(coord), hex.hexes),
          hex,
        );
      }, hexes);
    }

    borderTexts = concat(game.map[gameMap.copy].borderTexts || [], borderTexts);

    let copyBorders = game.map[gameMap.copy].borders || [];
    borders = concat(
      without(gameMap.removeBorders || [], copyBorders),
      borders,
    );

    lines = concat(game.map[gameMap.copy].lines || [], lines);
  }
  hexes = map(resolveHex(hexes), hexes);

  // Trimming the top or left moves the hexes, any edge makes the map smaller
  // (up to the center of the first row or column of hexes)
  const coordsOfHexes = hexesToCoords(hexes);
  const minX = reduce(min, Infinity, map(nth(0), coordsOfHexes));
  const minY = reduce(min, Infinity, map(nth(1), coordsOfHexes));
  const shiftX = trimmed.left ? minX * halfHexWidth : 0;
  const shiftY = trimmed.top ? (minY - 1) * 1.5 * edge + edge : 0;
  const trimWidth = shiftX + (trimmed.right ? halfHexWidth : 0);
  const trimHeight = shiftY + (trimmed.bottom ? edge : 0);

  let maxX = maxMapX(hexes);
  let maxY = maxMapY(hexes);

  let totalWidth =
    getTotalWidth(maxX, hexWidth, game.info.extraTotalWidth, coordSpace) -
    trimWidth;
  let totalHeight =
    getTotalHeight(maxY, hexWidth, game.info.extraTotalHeight, coordSpace) -
    trimHeight;
  let b18TotalHeight = totalHeight * squashRatio;
  let printWidth = `${Math.ceil(51.5 + totalWidth) / 100.0}in`;
  let printHeight = `${Math.ceil(51.5 + totalHeight) / 100.0}in`;
  let b18PrintHeight = `${(50 + b18TotalHeight) / 100.0}in`;
  let humanWidth = `${Math.ceil((50 + totalWidth) / 100.0)}in`;
  let humanHeight = `${Math.ceil((50 + totalHeight) / 100.0)}in`;

  // which orientation for the hexes:
  //   default is points up/down
  //   "horizontal" is flats up/down
  let mapCoordinates = game.info.mapCoordinates;

  let a1Valid = true;
  let expCoord = toCoords(hexes[0].hexes[0]);
  if (expCoord[0] % 2 === 0) {
    if (expCoord[1] % 2 !== 0) {
      a1Valid = false;
    }
  } else {
    if (expCoord[1] % 2 === 0) {
      a1Valid = false;
    }
  }

  // The halves of the hex at [x, y] that the trimmed edges leave, as page
  // directions: the outermost row or column is cut through its centers
  const trimHalves = (x, y) => {
    const halves = [
      trimmed.top && y === minY && (horizontal ? "right" : "bottom"),
      trimmed.bottom && y === maxY && (horizontal ? "left" : "top"),
      trimmed.left && x === minX && (horizontal ? "bottom" : "right"),
      trimmed.right && x === maxX && (horizontal ? "top" : "left"),
    ].filter(Boolean);
    return halves.length > 0 ? halves : NO_HALVES;
  };

  return {
    // Is this map in horizontal layout?
    horizontal,

    // Which halves of the hex at the coordinates stay, by the trimmed edges
    trimHalves,

    // Hex width flat to flat
    hexWidth,
    halfHexWidth,
    edge,
    scale,
    a1Valid,

    // Title options
    title: gameMap.title,

    // Coords choice: "edge" or "outside"
    coords,

    // Which axis to put the letters and numbers on:
    //   "reversed" flips normal behavior.
    //   "lettersHorizontal" == "numbersVertical"
    //   "lettersVertical" == "numbersHorizontal"
    mapCoordinates,

    // How much space and offset to use due to coordinate choice
    coordSpace,
    coordOffset,

    // Biggest coords
    maxX: horizontal ? maxY : maxX,
    maxY: horizontal ? maxX : maxY,

    // Total height and width in svg units
    totalWidth: horizontal ? totalHeight : totalWidth,
    totalHeight: horizontal ? totalWidth : totalHeight,
    b18TotalWidth: horizontal ? b18TotalHeight : totalWidth,
    b18TotalHeight: horizontal ? totalWidth : b18TotalHeight,

    // Print height and width in CSS units
    printWidth: horizontal ? printHeight : printWidth,
    printHeight: horizontal ? printWidth : printHeight,
    b18PrintWidth: horizontal ? b18PrintHeight : printWidth,
    b18PrintHeight: horizontal ? printWidth : b18PrintHeight,

    // Human readable width and height
    humanWidth: horizontal ? humanHeight : humanWidth,
    humanHeight: horizontal ? humanWidth : humanHeight,

    // Function to computer coordinates of a hex
    hexX: horizontal ? hexY : hexX,
    hexY: horizontal ? hexX : hexY,

    // Where to place coordinates
    topCoord: horizontal
      ? leftCoord(hexes, hexWidth, shiftX)
      : topCoord(hexes, hexWidth, shiftY),
    leftCoord: horizontal
      ? topCoord(hexes, hexWidth, shiftY)
      : leftCoord(hexes, hexWidth, shiftX),
    bottomCoord: horizontal
      ? rightCoord(
          hexes,
          hexWidth,
          shiftX,
          trimWidth > 0 ? totalWidth : undefined,
        )
      : bottomCoord(
          hexes,
          hexWidth,
          shiftY,
          trimHeight > 0 ? totalHeight : undefined,
        ),
    rightCoord: horizontal
      ? bottomCoord(
          hexes,
          hexWidth,
          shiftY,
          trimHeight > 0 ? totalHeight : undefined,
        )
      : rightCoord(
          hexes,
          hexWidth,
          shiftX,
          trimWidth > 0 ? totalWidth : undefined,
        ),

    // How far the hexes moved by trimming the top and the left of the page
    trimShift: horizontal ? { x: shiftY, y: shiftX } : { x: shiftX, y: shiftY },

    // The resolved map variation
    map: gameMap,

    // The resolved hexes
    hexes,

    // Borders and Lines
    borderTexts,
    borders,
    lines,
  };
};
