import * as R from "ramda";
import { alpha } from "./data";

const groupsOf = R.curry(function group(n, list) {
  return R.isEmpty(list)
    ? []
    : R.prepend(R.take(n, list), group(n, R.drop(n, list)));
});


const HEX_RATIO = 0.57735;

const hexPointsVertical = (width, edge, x, y) => [
  [x, y - edge],
  [x + width * 0.5, y - edge * 0.5],
  [x + width * 0.5, y + edge * 0.5],
  [x, y + edge],
  [x - width * 0.5, y + edge * 0.5],
  [x - width * 0.5, y - edge * 0.5]
];

const hexPointsHorizontal = (width, edge, x, y) => [
  [x - edge * 0.5, y + width * 0.5],
  [x - edge, y],
  [x - edge * 0.5, y - width * 0.5],
  [x + edge * 0.5, y - width * 0.5],
  [x + edge, y],
  [x + edge * 0.5, y + width * 0.5]
];

const hexData = (width, vertical = true, x, y) => {
  let edge = width * HEX_RATIO;

  if (x === undefined) {
    x = edge;
  }

  if (y === undefined) {
    y = edge;
  }

  let points = vertical
    ? hexPointsVertical(width, edge, x, y)
    : hexPointsHorizontal(width, edge, x, y);

  let sides = R.mapAccum(
    ([x1, y1], [x2, y2]) => [[x2, y2], [(x1 + x2) / 2.0, (y1 + y2) / 2.0]],
    R.last(points),
    points
  )[1];

  let middle = [x, y];

  return { x, y, width, edge, middle, points, sides };
};

const linear = R.curry((percent, p1, p2) => [
  p1[0] * percent + p2[0] * (1.0 - percent),
  p1[1] * percent + p2[1] * (1.0 - percent)
]);

const midpoint = linear(0.5);

const pointsToString = R.compose(
  R.join(" "),
  R.map(R.join(","))
);

const trackType = track => {
  if (track.end === undefined && track.start === undefined) {
    return null;
  } else if (track.end === undefined) {
    return "city";
  } else if (track.start === undefined) {
    return "stop";
  } else {
    let diff = Math.abs(track.start - track.end);
    if (diff > 3) {
      diff = Math.abs(6 - diff);
    }

    switch (diff) {
      case 1:
        return "sharp";
      case 2:
        return "gentle";
      case 3:
        return "straight";
      default:
        return "city";
    }
  }
};

const fillArray = R.curry((getNumber, array) => {
  return R.chain(a => Array(getNumber(a)).fill(a), array);
});

const marketColor = R.curry((limits, value) => {
  return R.propOr(
    "plain",
    "color",
    R.find(limit => R.lte(value, limit.value), R.reverse(limits))
  );
});

const toAlpha = num => {
  if (num <= 0) {
    return "";
  } else if (num <= alpha.length) {
    return R.nth(num - 1, alpha);
  } else {
    let remainder = num % alpha.length;
    if(remainder === 0) {
      remainder = alpha.length;
    }
    let quotient = Math.floor((num - 1) / alpha.length);
    return `${toAlpha(quotient)}${toAlpha(remainder)}`;
  }
};

const alphaToInt = R.compose(
  R.reduce((total, c) => {
    return total * alpha.length + (R.indexOf(c, alpha) + 1);
  }, 0),
  R.splitEvery(1)
);

const coordsRegExp = /([a-z]+)([0-9]+)/i;
const toCoords = str => {
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

const maxMapX = R.compose(
  R.reduce(R.max, 1),
  R.map(R.nth(0)),
  R.map(toCoords),
  R.chain(R.prop("hexes"))
);

const maxMapY = R.compose(
  R.reduce(R.max, 1),
  R.map(R.nth(1)),
  R.map(toCoords),
  R.chain(R.prop("hexes"))
);

const hexesToCoords = R.compose(R.map(toCoords), R.chain(R.prop("hexes")));

const topCoord = (hexes, x) => {
  let coords = hexesToCoords(hexes);
  let filtered = R.filter(c => c[0] === x, coords);
  let maxHex = R.reduce((m,x) => R.min(m, R.nth(1,x)), 1000, filtered);

  let extra = 0;
  let hexesAbove = R.filter(c => R.equals(c, [x - 1, maxHex - 1]) || R.equals(c, [x + 1, maxHex - 1]),
                            coords);
  if(hexesAbove.length > 0) {
    extra = 150 * HEX_RATIO;
  }

  let y = (x % 2 === 0 ? 35 : 33) + (1.5 * 150 * HEX_RATIO * (maxHex - 1)) - extra;
  return y;
};

const bottomCoord = (hexes, x) => {
  let coords = hexesToCoords(hexes);
  let filtered = R.filter(c => c[0] === x, coords);
  let maxHex = R.reduce((m,x) => R.max(m, R.nth(1,x)), 1, filtered);

  let extra = 0;
  let hexesAbove = R.filter(c => R.equals(c, [x - 1, maxHex + 1]) || R.equals(c, [x + 1, maxHex + 1]),
                            coords);
  if(hexesAbove.length > 0) {
    extra = 150 * HEX_RATIO;
  }

  let y = (x % 2 === 0 ? -23 : -21) + (1.5 * 150 * HEX_RATIO * (maxHex + 1)) + extra;
  return y;
};

const leftCoord = (hexes, y) => {
  let filtered = R.filter(c => c[1] === y, hexesToCoords(hexes));
  let maxHex = R.reduce((m,x) => R.min(m, R.nth(0,x)), 1000, filtered);
  let x = 35 + (150 * 0.5 * (maxHex - 1));
  return x;
};

const rightCoord = (hexes, y) => {
  let filtered = R.filter(c => c[1] === y, hexesToCoords(hexes));
  let maxHex = R.reduce((m,x) => R.max(m, R.nth(0,x)), 1, filtered);
  let x = 65 + (150 * 0.5 * (maxHex + 1));
  return x;
};

const resolveHex = (hex, hexes) => {
  if (hex.copy) {
    // Find copy
    let copyHex = R.find(h => R.indexOf(hex.copy, h.hexes) > -1, hexes);

    if (copyHex) {
      let merged = mergeHex(hex, resolveHex(copyHex, hexes));

      delete merged.copy;

      return merged;
    }
  }

  // Nothing to copy
  return hex;
}

const mergeHex = (a, b) => {
  // First check if we need to merge deep!
  return R.mergeDeepWithKey((key, da, db) => {
    if (Array.isArray(da)) {
      if(key === "track" || key === "offBoardTrack") {
        // Concat tracks
        return R.concat(da, db);
      } else if(key === "companies") {
        // New companies only
        return da;
      } else {
        return R.zipWith(mergeHex, da, db);
      }
    } else {
      return da;
    }
  }, a, b);
};

const equalPages = (total, page) => {
  let pages = Math.ceil(total/page);

  let result = new Array(pages);
  result.fill(total/pages);
  return result;
};

const maxPages = (total, page) => {
  let helper = (total, page, result) => {
    if(total <= page) {
      return R.append(total, result);
    } else if(total <= (2 * page)) {
      let width = total * 0.5;
      return R.prepend(width, R.append(width, result));
    } else {
      return helper(total - page, page, R.append(page, result));
    }
  };

  return helper(total, page, []);
};

export default {
  groupsOf,
  HEX_RATIO,
  hexData,
  linear,
  midpoint,
  pointsToString,
  trackType,
  fillArray,
  marketColor,
  maxMapX,
  maxMapY,
  toAlpha,
  toCoords,
  mergeHex,
  resolveHex,
  equalPages,
  maxPages,
  topCoord,
  bottomCoord,
  leftCoord,
  rightCoord
};
