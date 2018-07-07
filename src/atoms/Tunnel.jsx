import React from "react";
import { colors } from "../data";

const Tunnel = ({ cost }) => {
  return (
    <g>
      <path
        d="M -28 19 L 0 -22 L 28 19 Z"
        fill={colors["mountain"]}
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

export default Tunnel;
