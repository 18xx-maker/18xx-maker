import * as R from 'ramda';

const HEX_RATIO = 0.57735;

const hexPointsVertical = (width, edge, x, y) => [
  [x - width * 0.5, y - edge * 0.5],
  [x, y - edge],
  [x + width * 0.5, y - edge * 0.5],
  [x + width * 0.5, y + edge * 0.5],
  [x, y + edge],
  [x - width * 0.5, y + edge * 0.5]
];

const hexPointsHorizontal = (width, edge, x, y) => [
  [x - edge * 0.5, y - width * 0.5],
  [x + edge * 0.5, y - width * 0.5],
  [x + edge, y],
  [x + edge * 0.5, y + width * 0.5],
  [x - edge * 0.5, y + width * 0.5],
  [x - edge, y]
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

  return { x, y, width, edge, points, sides };
};

const linear = R.curry((percent, p1, p2) => [
  p1[0] * percent + p2[0] * (1.0 - percent),
  p1[1] * percent + p2[1] * (1.0 - percent)
]);

const midpoint = linear(0.5);

const pointsToString = R.compose(R.join(" "), R.map(R.join(",")));

export default { HEX_RATIO, hexData, linear, midpoint, pointsToString };
