import React from "react";
import { colors } from "../data";

const Industry = ({ top, bottom }) => {
  return (
    <g>
      <circle
        fill={colors["white"]}
        stroke="none"
        r="18"
        cx="0"
        cy="0" />
      <path
        d="M -18 0 A 18 18 0 0 1 18 0 Z"
        fill={colors["pink"]}
        fillOpacity="0.2"
        stroke={colors["pink"]}
        strokeWidth="2"
      />
      <path
        d="M -18 0 A 18 18 0 0 0 18 0 Z"
        fill="none"
        stroke={colors["pink"]}
        strokeWidth="2"
      />
      <text
        fontWeight="bold"
        fontSize={12}
        fontFamily="Helvetica, Arial, sans-serif"
        fill={colors["pink"]}
        alignmentBaseline="central"
        textAnchor="middle"
        x="0"
        y="-8"
      >
        {top}
      </text>
      <text
        fontWeight="bold"
        fontSize={12}
        fontFamily="Helvetica, Arial, sans-serif"
        fill={colors["pink"]}
        alignmentBaseline="central"
        textAnchor="middle"
        x="0"
        y="8"
      >
        {bottom}
      </text>
    </g>
  );
};

export default Industry;
