import React from "react";
import { colors } from "./data";
import games from "./data/games";
import * as R from "ramda";
import util from "./util";
import Hex from "./Hex";
import Title from "./Title";
import Svg from "./Svg";

const HEX_RATIO = 0.57735;

const Map = ({ match }) => {
  let game = games[match.params.game];
  let map = game.map;

  if(!map) {
    return null;
  }

  let hexWidth = game.info.width;
  let edge = hexWidth * HEX_RATIO;
  let halfHexWidth = 0.5 * hexWidth;
  let maxX = util.maxMapX(map.hexes);
  let maxY = util.maxMapY(map.hexes);
  let totalWidth = halfHexWidth * (maxX + 1);
  let totalHeight = 1.5 * (maxY - 1) * edge + 2 * edge;

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
          <Hex hex={hex} id={`${util.toAlpha(y)}${x}`} border={true} />
        </g>
      );
    }, hex.hexes || []);
  }, map.hexes);

  return (
    <div className="cutlines">
      <div className="map">
        <Svg width={totalWidth} height={totalHeight}>
          <Title game={game} />
          {hexes}
        </Svg>
      </div>
    </div>
  );
};

export default Map;
