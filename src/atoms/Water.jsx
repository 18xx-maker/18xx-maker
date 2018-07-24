import React from "react";
import { colors } from "../data";

const Water = ({ size, cost, border }) => {
  let path;
  let radius;
  let fontSize;
  let width;
  switch (size) {
    case "large":
      path =
        "M -35 -10 a 10 10 0 0 0 20 0 a 10 10 0 0 0 20 0 a 10 10 0 0 0 20 0" +
        "M -25 -30 a 10 10 0 0 0 20 0 a 10 10 0 0 0 20 0 a 10 10 0 0 0 20 0";
      radius = 52;
      fontSize = 22;
      width = 4;
      break;
    case "medium":
      path =
        "M -26.25  -7.5 a 7.5 7.5 0 0 0 15 0 a 7.5 7.5 0 0 0 15 0 a 7.5 7.5 0 0 0 15 0" +
        "M -18.75 -22.5 a 7.5 7.5 0 0 0 15 0 a 7.5 7.5 0 0 0 15 0 a 7.5 7.5 0 0 0 15 0";
      radius = 40;
      fontSize = 18;
      width = 3;
      break;
    case "small":
    default:
      radius = 28;
      fontSize = 14;
      width = 2;
      path =
        "M -17.5  -5 a 5 5 0 0 0 10 0 a 5 5 0 0 0 10 0 a 5 5 0 0 0 10 0" +
        "M -12.5 -15 a 5 5 0 0 0 10 0 a 5 5 0 0 0 10 0 a 5 5 0 0 0 10 0";
      break;
    case "tiny":
      radius = 15;
      fontSize = 9;
      width = 1;
      path =
        "M -8.75  -5 a 2.5 2.5 0 0 0 5 0 a 2.5 2.5 0 0 0 5 0 a 2.5 2.5 0 0 0 5 0" +
        "M -6.25 -10 a 2.5 2.5 0 0 0 5 0 a 2.5 2.5 0 0 0 5 0 a 2.5 2.5 0 0 0 5 0";
  }

  return (
    <g>
      {border && (
        <circle
          cx="0"
          cy="0"
          r={radius}
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
      )}
      <path
        d={path}
        fill="none"
        stroke={colors["water"]}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        fill={colors["black"]}
        fontSize={fontSize}
        alignmentBaseline="hanging"
        textAnchor="middle"
        x="0"
        y={-6 + fontSize * 0.8}
      >
        {cost}
      </text>
    </g>
  );
};

export default Water;
