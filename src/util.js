import * as R from "ramda";

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
  return R.propOr("plain", "color", R.find(limit => R.lte(value, limit.value), R.reverse(limits)));
});

export default {
  HEX_RATIO,
  hexData,
  linear,
  midpoint,
  pointsToString,
  trackType,
  fillArray,
  marketColor
};
