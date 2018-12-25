import React from "react";
import { colors } from "../data";

const Company = ({ label, bottom, left, right, radius, color }) => {
  let size = 13;
  radius = radius || 6;

  let y = bottom ? (2 * radius) : -(2 * radius);

  let x = label.length * 3 + 5;
  let r = (x + (right || 0) + (x + (left || 0))) * 2;


  return (
    <g>
      <path
        d={`M ${-x - (left || 0)} ${y} A ${r} ${r} 0 0 ${bottom ? 0 : 1} ${x +
          (right || 0)} ${y}`}
        stroke={colors["track"]}
        strokeWidth="1"
        fill="none"
      />
      <circle
        fill={colors[color || "border"]}
        stroke={colors["track"]}
        strokeWidth="1"
        cx={x + (right || 0)}
        cy={y}
        r={radius}
      />
      <circle
        fill={colors[color || "border"]}
        stroke={colors["track"]}
        strokeWidth="1"
        cx={-x - (left || 0)}
        cy={y}
        r={radius}
      />
      <text
        fontWeight="bold"
        fontSize={size}
        fontFamily="Helvetica, Arial, sans-serif"
        fill={colors["track"]}
        alignmentBaseline={bottom ? "baseline" : "hanging"}
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
