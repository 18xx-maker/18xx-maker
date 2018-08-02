import React from "react";
import { colors } from "../data";

const Company = ({ label, bottom }) => {
  let size = 13;
  let y = bottom ? 12 : -12;

  let x = label.length * 5 + 5;

  return (
    <g>
      <path
        d={`M ${-x} ${y} l ${2*x} 0`}
        stroke={colors["track"]}
        strokeWidth="1"
        fill="none"
      />
      <circle
        fill={colors["border"]}
        stroke={colors["track"]}
        strokeWidth="1"
        cx={x}
        cy={y}
        r="4"
      />
      <circle
        fill={colors["border"]}
        stroke={colors["track"]}
        strokeWidth="1"
        cx={-x}
        cy={y}
        r="4"
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
        {label}
      </text>
    </g>
  );
};

export default Company;
