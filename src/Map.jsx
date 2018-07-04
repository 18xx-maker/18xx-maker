import React from "react";
import { color } from "./data";
import games from "./data/games";
import * as R from "ramda";
import util from "./util";
import Hex from "./Hex";

const HEX_RATIO = 0.57735;

const Map = ({ match }) => {
  let game = games[match.params.game];
  let map = game.map;

  let hexWidth = map.hexWidth;
  let edge = hexWidth * HEX_RATIO;
  let halfHexWidth = 0.5 * hexWidth;
  let maxX = util.maxMapX(map.hexes);
  let maxY = util.maxMapY(map.hexes);
  let totalWidth = halfHexWidth * (maxX + 1);
  let totalHeight = 1.5 * (maxY-1) * edge + 2 * edge;

  console.log({
    hexWidth,
    edge,
    halfHexWidth,
    maxX,
    maxY,
    totalWidth,
    totalHeight
  });

  let hexX = (x, y) => {
    return x * halfHexWidth;
  };

  let hexY = (x, y) => {
    return (y - 1) * 1.5 * edge + edge;
  };

  let hexes = R.chain(hex => {
    let color = hex.color;
    return R.map(([x, y]) => {
      return (
        <g transform={`translate(${hexX(x, y)} ${hexY(x, y)})`}>
          <Hex hex={hex} border={true} />
        </g>
      );
    }, hex.hexes || []);
  }, map.hexes);

  return (
    <svg width={totalWidth} height={totalHeight}>
      {hexes}
    </svg>
  );
};

export default Map;
