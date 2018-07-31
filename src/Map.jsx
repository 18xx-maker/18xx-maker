import React from "react";
import * as R from "ramda";
import util from "./util";
import Hex from "./Hex";

const Map = ({ game, variation }) => {
  variation = variation || 0;
  let map = Array.isArray(game.map) ? game.map[variation] : game.map;

  if (!map) {
    return null;
  }

  let hexWidth = game.info.width;
  let edge = hexWidth * util.HEX_RATIO;
  let halfHexWidth = 0.5 * hexWidth;

  let hexX = (x, y) => {
    return x * halfHexWidth;
  };

  let hexY = (x, y) => {
    return (y - 1) * 1.5 * edge + edge;
  };

  let hexes = R.map(R.assoc("variation", variation), map.hexes);
  if (map.copy !== undefined) {
    hexes = R.concat(
      R.map(R.assoc("variation", map.copy), game.map[map.copy].hexes),
      hexes
    );
  }

  return R.chain(hex => {
    let resolvedHex = util.resolveHex(hex, map.hexes);

    return R.map(([x, y]) => {
      let translate =
        game.info.orientation === "horizontal"
          ? `translate(${hexY(x, y)} ${hexX(x, y)})`
          : `translate(${hexX(x, y)} ${hexY(x, y)})`;
      return (
        <g
          transform={`${translate}`}
          key={`hex-${resolvedHex.variation}-${util.toAlpha(y)}${x}`}
        >
          <Hex hex={resolvedHex} id={`${util.toAlpha(y)}${x}`} border={true} />
        </g>
      );
    }, R.map(util.toCoords, hex.hexes || []));
  }, hexes);
};

export default Map;
