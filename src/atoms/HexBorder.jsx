import React from "react";
import { useOrientation } from "../context/OrientationContext";
import Color from "../data/Color";

import chain from "ramda/src/chain";
import includes from "ramda/src/includes";

const LINES = [
  "-86.6025 0",
  "-43.30125 -75",
  "43.30125 -75",
  "86.6025 0",
  "43.30125 75",
  "-43.30125 75"
];

const drawLine = (removeBorders, border, side) => {
  return border && !includes(side, (removeBorders || []));
};

const HexBorder = ({ removeBorders, border, map }) => {
  const rotation = useOrientation();

  return (
    <Color context={map ? "map" : "tile"}>
      {(c,t) => {
        let lines = chain(side => {
          if (drawLine(removeBorders, border, side)) {
            let first = LINES[(side + 3) % 6];
            let second = LINES[(side + 4) % 6];
            return [(<path key={`side-${side}`}
                          d={`M ${first} L ${second}`}
                          strokeLinecap="round"
                          strokeWidth="2"
                          stroke={c("black")} />)]
          } else {
            return [];
          }
        }, [1,2,3,4,5,6]);

        return (
          <g transform={`rotate(${rotation})`}>
            {lines}
          </g>
        )
      }}
    </Color>
  );
};

export default HexBorder;
