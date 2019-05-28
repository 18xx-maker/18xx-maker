import React from "react";
import Color from "../data/Color";

import chain from "ramda/src/chain";
import concat from "ramda/src/concat";
import range from "ramda/src/range";

import { toAlpha } from "./util";

export const Coordinate = ({x, y, label}) => (
  <Color>
    {c => (
      <text
        fill={c("black")}
        fontFamily="display"
        fontWeight="bold"
        fontSize="16"
        dominantBaseline="central"
        textAnchor="middle"
        lengthAdjust="spacingAndGlyphs"
        x={x}
        y={y}>
        {label}
      </text>
    )}
  </Color>
);

export const Coordinates = ({horizontal, coords, maxX, maxY, hexX, hexY, totalWidth, totalHeight, topCoord, bottomCoord, leftCoord, rightCoord}) => {
  if (coords !== "edge" && coords !== "outside") {
    return null;
  }

  return concat(chain(x => [
    <Coordinate key={`start-row-${x}`}
                x={horizontal ? hexX(0, x) : hexX(x, 0)}
                y={coords === "edge" ? topCoord(x) : 25}
                label={horizontal ? toAlpha(x) : x} />,
    <Coordinate key={`end-row-${x}`}
                x={horizontal ? hexX(0, x) : hexX(x, 0)}
                y={coords === "edge" ? bottomCoord(x) : (totalHeight - 25)}
                label={horizontal ? toAlpha(x) : x} />
  ], range(1, maxX + 1)), chain(y => [
    <Coordinate key={`start-col-${y}`}
                x={coords === "edge" ? leftCoord(y) : 25}
                y={horizontal ? hexY(y, 0) : hexY(0, y)}
                label={horizontal ? y : toAlpha(y)} />,
    <Coordinate key={`end-col-${y}`}
                x={coords === "edge" ? rightCoord(y) : (totalWidth - 25)}
                y={horizontal ? hexY(y, 0) : hexY(0, y)}
                label={horizontal ? y : toAlpha(y)} />
  ], range(1, maxY + 1)));
};

export default Coordinates;
