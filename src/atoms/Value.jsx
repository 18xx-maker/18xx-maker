import React from "react";
import { colors } from "../data";

const Value = ({ value }) => {
  let size = 15;
  if (value > 99) {
    size = 13;
  }

  return (
    <g>
      <circle
        fill={colors["border"]}
        stroke={colors["track"]}
        strokeWidth="2"
        cx="0"
        cy="0"
        r="15"
      />
      <text
        fontWeight="bold"
        fontSize={size}
        fontFamily="Helvetica, Arial, sans-serif"
        fill={colors["track"]}
        alignmentBaseline="central"
        textAnchor="middle"
        x="0"
        y="0"
      >
        {value}
      </text>
    </g>
  );
};

export default Value;
