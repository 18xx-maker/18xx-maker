import React from "react";
import * as R from "ramda";
import util from "./util";
import Hex from "./Hex";
import { coords } from "./data";
import Color from "./data/Color";

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
      (game.info.extraTotalWidth || 0) +
      ((coords === "edge" || coords === "outside") ? 100 : 0) +
      halfHexWidth * (maxX + 1);
  let totalHeight =
      (game.info.extraTotalHeight || 0) +
      ((coords === "edge" || coords === "outside") ? 100 : 0) +
      (1.5 * (maxY - 1) * edge + 2 * edge);

  if (game.info.orientation === "horizontal") {
    let tmp = totalWidth;
    totalWidth = totalHeight;
    totalHeight = tmp;
  }

  let coordinates = R.concat(
    R.chain(
      x => [
        <Color>{c => (
          <text
            key={`start-row-${x}`}
            fill={c("black")}
            fontFamily="Bitter"
            fontWeight="normal"
            fontSize="16"
            dominantBaseline="central"
            textAnchor="middle"
            lengthAdjust="spacingAndGlyphs"
            x={
              (game.info.orientation === "horizontal" ? hexY(0, x) : hexX(x, 0)) +
                50
            }
            y={coords === "edge" ?
               (game.info.orientation !== "horizontal" ?
                util.topCoord(hexes, x) :
                util.leftCoord(hexes, x)) :
               25}
          >
            {game.info.orientation === "horizontal" ? util.toAlpha(x) : x}
          </text>)}</Color>,
        <Color>{c => (
          <text
            key={`end-row-${x}`}
            fill={c("black")}
            fontFamily="Bitter"
            fontWeight="bold"
            fontSize="16"
            dominantBaseline="central"
            textAnchor="middle"
            lengthAdjust="spacingAndGlyphs"
            x={
              (game.info.orientation === "horizontal" ? hexY(0, x) : hexX(x, 0)) +
                50
            }
            y={coords === "edge" ?
               (game.info.orientation !== "horizontal" ?
                util.bottomCoord(hexes, x) :
                util.rightCoord(hexes, x)) :
               (totalHeight - 25)}
          >
            {game.info.orientation === "horizontal" ? util.toAlpha(x) : x}
          </text>)}</Color>
      ],
      R.range(1, (game.info.orientation === "horizontal" ? maxY : maxX) + 1)
    ),
    R.chain(
      y => [
        <Color>{c => (
          <text
            key={`start-col-${y}`}
            fill={c("black")}
            fontFamily="Bitter"
            fontWeight="bold"
            fontSize="16"
            dominantBaseline="central"
            textAnchor="middle"
            lengthAdjust="spacingAndGlyphs"
            x={coords === "edge" ?
               (game.info.orientation !== "horizontal" ?
                util.leftCoord(hexes, y) :
                util.topCoord(hexes, y)) :
               25}
            y={
              (game.info.orientation !== "horizontal" ?
               hexY(0, y) :
               hexX(y, 0)) +
                50
            }
          >
            {game.info.orientation === "horizontal" ? y : util.toAlpha(y)}
          </text>)}</Color>,
        <Color>{c => (
          <text
            key={`end-col-${y}`}
            fill={c("black")}
            fontFamily="Bitter"
            fontWeight="bold"
            fontSize="16"
            dominantBaseline="central"
            textAnchor="middle"
            lengthAdjust="spacingAndGlyphs"
            x={coords === "edge" ?
               (game.info.orientation !== "horizontal" ?
                util.rightCoord(hexes, y) :
                util.bottomCoord(hexes, y)) :
               (totalWidth - 25)}
            y={
              (game.info.orientation !== "horizontal" ?
               hexY(0, y) :
               hexX(y, 0)) +
                50
            }
          >
            {game.info.orientation === "horizontal" ? y : util.toAlpha(y)}
          </text>)}</Color>
      ],
      R.range(1, (game.info.orientation === "horizontal" ? maxX : maxY) + 1)
    )
  );

  let mapHexes = R.chain(hex => {
    let resolvedHex = util.resolveHex(hex, hexes);

    return R.map(([x, y]) => {
      let translate =
          game.info.orientation === "horizontal"
          ? `translate(${hexY(x, y) + ((coords === "edge" || coords === "outside") ? 50 : 0)} ${hexX(x, y) + ((coords === "edge" || coords === "outside") ? 50 : 0)})`
          : `translate(${hexX(x, y) + ((coords === "edge" || coords === "outside") ? 50 : 0)} ${hexY(x, y) + ((coords === "edge" || coords === "outside") ? 50 : 0)})`;
      let coord = `${util.toAlpha(y)}${x}`;
      return (
        <g
          transform={`${translate}`}
          key={`hex-${resolvedHex.variation}-${coord}`}
        >
          <Hex hex={resolvedHex} border={true} transparent={game.info.transparent} map={true} id={coords === "inside" && coord} />
        </g>
      );
    }, R.map(util.toCoords, hex.hexes || []));
  }, hexes);

  return R.concat(((coords === "edge" || coords === "outside") ?
                   coordinates : []),
                  mapHexes);
};

export default Map;
