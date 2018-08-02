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
  } else if (num <= 26) {
    return R.nth(num - 1, alpha);
  } else {
    let remainder = num % 26;
    let quotient = Math.floor(num / 26);
    return `${toAlpha(quotient)}${R.nth(remainder - 1, alpha)}`;
  }
};

const alphaToInt = R.compose(
  R.reduce((total, c) => {
    return total * 26 + (R.indexOf(c, alpha) + 1);
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

const resolveHex = (hex, hexes) => {
  if (hex.copy) {
    // Find copy
    let copyHex = R.find(h => R.indexOf(hex.copy, h.hexes) > -1, hexes);

    if (copyHex) {
      return mergeHex(hex, resolveHex(copyHex, hexes));
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
      } else {
        return R.zipWith(mergeHex, da, db);
      }
    } else if (da instanceof Object) {
      return mergeHex(da, db);
    } else {
      return da;
    }
  }, a, b);
};

const pages = (total, page) => {
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
  pages
};
