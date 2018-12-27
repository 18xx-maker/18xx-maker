import React from "react";
import { colors } from "../data";

const Water = ({ cost }) => {
  let fontSize = 15;
  let width = 2;
  let path =
      "M -15 -12 Q -7.5 -20, 0 -12 S 7.5 -4, 15 -12" +
      "M -15 -7  Q -7.5 -15, 0 -7  S 7.5 1,  15 -7";

  return (
    <g>
      <path
        transform="translate(0 1)"
        d={path}
        fill="none"
        stroke={colors["white"]}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
        y="0"
      >
        {cost}
      </text>
    </g>
  );
};

export default Water;
