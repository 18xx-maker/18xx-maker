import React from "react";
import { colors } from "../data";

const Bridge = ({ cost }) => {
  return (
    <g>
      <path
        d="M -28 -5 L 0 36 L 28 -5 Z"
        fill={colors["water"]}
        stroke={colors["black"]}
        strokeWidth="2"
        strokeLinecap="round"
        x="0"
        y="0"
      />
      <text
        fill={colors["white"]}
        fontSize="14"
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

export default Bridge;
