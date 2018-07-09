import React from "react";
import { colors } from "../data";

const Tunnel = ({ cost }) => {
  return (
    <g>
      <path
        d="M -22 13 L 0 -24 L 22 13 Z"
        fill={colors["mountain"]}
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

export default Tunnel;
