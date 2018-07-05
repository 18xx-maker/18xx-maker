import React from "react";
import { colors } from "./data";
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
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width={totalWidth}
          height={totalHeight}
        >
          <defs>
            <style>
              @import url("https://fonts.googleapis.com/css?family=Bitter:700");
            </style>
            <clipPath id="hexClip">
              <polygon
                points="0,-86.6025 75,-43.30125 75,43.30125 0,86.6025 -75,43.30125 -75,-43.30125"
                fill="black"
                stroke="none"
              />
            </clipPath>
          </defs>
          {hexes}
          <text
            fill={colors["track"]}
            fontFamily="Bitter"
            fontWeight="bold"
            fontSize={game.title.size || 200}
            alignmentBaseline="hanging"
            textAnchor="start"
            lengthAdjust="spacingAndGlyphs"
            x={game.title.x}
            y={game.title.y}
          >
            {game.title.title}
          </text>
          <text
            fill={colors["track"]}
            fontFamily="Bitter"
            fontWeight="bold"
            fontSize={game.designer.size || 40}
            alignmentBaseline="hanging"
            textAnchor="start"
            lengthAdjust="spacingAndGlyphs"
            x={game.designer.x}
            y={game.designer.y}
          >
            {game.designer.designer}
          </text>
        </svg>
      </div>
    </div>
  );
};

export default Map;
