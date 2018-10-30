import React from "react";
import * as R from "ramda";
import util from "./util";
import Hex from "./Hex";
import { colors } from "./data";

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

  let maxX = util.maxMapX(hexes);
  let maxY = util.maxMapY(hexes);

  let totalWidth =
    (game.info.extraTotalWidth || 0) + 100 + halfHexWidth * (maxX + 1);
  let totalHeight =
    (game.info.extraTotalHeight || 0) +
    100 +
    (1.5 * (maxY - 1) * edge + 2 * edge);

  if (game.info.orientation === "horizontal") {
    let tmp = totalWidth;
    totalWidth = totalHeight;
    totalHeight = tmp;
  }

  let coords = R.concat(
    R.chain(
      x => [
        <text
          key={`start-row-${x}`}
          fill={colors["track"]}
          fontFamily="Bitter"
          fontWeight="normal"
          fontSize="16"
          alignmentBaseline="central"
          textAnchor="middle"
          lengthAdjust="spacingAndGlyphs"
          x={
            (game.info.orientation === "horizontal" ? hexY(0, x) : hexX(x, 0)) +
            50
          }
          y="25"
        >
          {game.info.orientation === "horizontal" ? util.toAlpha(x) : x}
        </text>,
        <text
          key={`end-row-${x}`}
          fill={colors["track"]}
          fontFamily="Bitter"
          fontWeight="bold"
          fontSize="16"
          alignmentBaseline="central"
          textAnchor="middle"
          lengthAdjust="spacingAndGlyphs"
          x={
            (game.info.orientation === "horizontal" ? hexY(0, x) : hexX(x, 0)) +
            50
          }
          y={totalHeight - 25}
        >
          {game.info.orientation === "horizontal" ? util.toAlpha(x) : x}
        </text>
      ],
      R.range(1, (game.info.orientation === "horizontal" ? maxY : maxX) + 1)
    ),
    R.chain(
      y => [
        <text
          key={`start-col-${y}`}
          fill={colors["track"]}
          fontFamily="Bitter"
          fontWeight="bold"
          fontSize="16"
          alignmentBaseline="central"
          textAnchor="middle"
          lengthAdjust="spacingAndGlyphs"
          x="25"
          y={
            (game.info.orientation !== "horizontal" ? hexY(0, y) : hexX(y, 0)) +
            50
          }
        >
          {game.info.orientation === "horizontal" ? y : util.toAlpha(y)}
        </text>,
        <text
          key={`end-col-${y}`}
          fill={colors["track"]}
          fontFamily="Bitter"
          fontWeight="bold"
          fontSize="16"
          alignmentBaseline="central"
          textAnchor="middle"
          lengthAdjust="spacingAndGlyphs"
          x={totalWidth - 25}
          y={
            (game.info.orientation !== "horizontal" ? hexY(0, y) : hexX(y, 0)) +
            50
          }
        >
          {game.info.orientation === "horizontal" ? y : util.toAlpha(y)}
        </text>
      ],
      R.range(1, (game.info.orientation === "horizontal" ? maxX : maxY) + 1)
    )
  );

  let mapHexes = R.chain(hex => {
    let resolvedHex = util.resolveHex(hex, hexes);

    return R.map(([x, y]) => {
      let translate =
        game.info.orientation === "horizontal"
          ? `translate(${hexY(x, y) + 50} ${hexX(x, y) + 50})`
          : `translate(${hexX(x, y) + 50} ${hexY(x, y) + 50})`;
      return (
        <g
          transform={`${translate}`}
          key={`hex-${resolvedHex.variation}-${util.toAlpha(y)}${x}`}
        >
          <Hex hex={resolvedHex} border={true} transparent={game.info.transparent} />
        </g>
      );
    }, R.map(util.toCoords, hex.hexes || []));
  }, hexes);

  return R.concat(coords, mapHexes);
};

export default Map;
