import React from "react";
import { colors } from "../data";

const Bridge = ({ cost }) => {
  return (
    <g>
      <path
        d="M -22 -12 L 0 25 L 22 -12 Z"
        fill={colors["water"]}
        stroke={colors["black"]}
        strokeWidth="2"
        strokeLinecap="round"
        x="0"
        y="0"
      />
      <text
        fill={colors["white"]}
        fontSize="10"
        alignmentBaseline="hanging"
        textAnchor="middle"
        x="0"
        y="-5"
      >
        {cost}
      </text>
    </g>
  );
};

export default Bridge;
