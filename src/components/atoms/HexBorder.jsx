import { useId } from "react";

import { chain, includes } from "ramda";

import Color from "@/components/Color";

import { useOrientation } from "@/context/OrientationContext";
import { halvesPolygon } from "@/util/hexClip";

const LINES = [
  "-86.6025 0",
  "-43.30125 -75",
  "43.30125 -75",
  "86.6025 0",
  "43.30125 75",
  "-43.30125 75",
];

const drawLine = (removeBorders, border, side) => {
  return border && !includes(side, removeBorders || []);
};

// halves: "top", "bottom", "left" or "right" (page directions) of the hex that
// stay. Only that part of the border is drawn: the sides the cut passes through
// stop at the cut, which gets no border.
const HexBorder = ({ removeBorders, border, map, halves = [] }) => {
  const rotation = useOrientation();
  const clipId = `hexBorderClip${useId().replace(/:/g, "")}`;

  return (
    <Color context={map ? "map" : "tile"}>
      {(c) => {
        let lines = chain(
          (side) => {
            if (drawLine(removeBorders, border, side)) {
              let first = LINES[(side + 3) % 6];
              let second = LINES[(side + 4) % 6];
              return [
                <path
                  key={`side-${side}`}
                  d={`M ${first} L ${second}`}
                  strokeLinecap="round"
                  strokeWidth="2"
                  stroke={c("black")}
                />,
              ];
            } else {
              return [];
            }
          },
          [1, 2, 3, 4, 5, 6],
        );

        if (halves.length === 0) {
          return <g transform={`rotate(${rotation})`}>{lines}</g>;
        }

        return (
          <g transform={`rotate(${rotation})`}>
            <clipPath id={clipId}>
              <polygon points={halvesPolygon(halves, rotation)} />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>{lines}</g>
          </g>
        );
      }}
    </Color>
  );
};

export default HexBorder;
