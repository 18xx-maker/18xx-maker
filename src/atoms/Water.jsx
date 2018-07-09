import React from "react";
import { colors } from "../data";

const Water = ({ size, cost, border }) => {
  let path;
  let width = 2;
  switch (size) {
    case "large":
      path =
        "M -52.5 -10   C -52.5   5,  -22.5   5,  -22.5 -10   C -22.5   5,    7.5   5,    7.5 -10   C  7.5   5,   37.5   5,   37.5 -10 " +
        "M -37.5 -32.5 C -37.5 -17.5, -7.5 -17.5, -7.5 -32.5 C  -7.5 -17.5, 22.5 -17.5, 22.5 -32.5 C 22.5 -17.5, 52.5 -17.5, 52.5 -32.5 ";
      width = 4;
      break;
    case "medium":
      path =
        "M -35  -5 C -35   5, -15   5, -15  -5 C -15   5,  5   5,  5  -5 C  5   5, 25   5, 25  -5 " +
        "M -25 -20 C -25 -10,  -5 -10,  -5 -20 C  -5 -10, 15 -10, 15 -20 C 15 -10, 35 -10, 35 -20 ";
      width = 3;
      break;
    default:
      path =
        "M -17.5  0   C -17.5  5,   -7.5  5,   -7.5  0   C -7.5  5,   2.5  5,   2.5  0   C 2.5   5,  12.5  5,   12.5  0 " +
        "M -12.5 -7.5 C -12.5 -2.5, -2.5 -2.5, -2.5 -7.5 C -2.5 -2.5, 7.5 -2.5, 7.5 -7.5 C 7.5 -2.5, 17.5 -2.5, 17.5 -7.5 ";
  }

  return (
    <g transform={`scale(${border ? 0.6 : 1.0})`}>
      {border && (
        <circle
          cx="0"
          cy="5"
          r="26"
          fill="white"
          stroke="black"
          strokeWidth="3.333333333"
        />
      )}
      <path
        d={path}
        fill="none"
        stroke={colors["water"]}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        x="0"
        y="0"
      />
      <text
        fill={colors["black"]}
        fontSize="14"
        alignmentBaseline="hanging"
        textAnchor="middle"
        x="0"
        y="10"
      >
        {cost}
      </text>
    </g>
  );
};

export default Water;
