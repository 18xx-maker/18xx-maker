import React from "react";
import Color from "../data/Color";

const Company = ({ label, reverse, bottom, left, right, radius, color }) => {
  let size = 13;
  radius = radius || 6;

  let y = bottom ? radius : -radius;
  let ty = reverse ? (5*y) : -y;

  let x = label.length * 3 + 5;
  let r = (x + (right || 0) + (x + (left || 0))) * 2;


  return (
    <Color context="companies">
      {(c, t, s, p) => (
        <g>
          <path
            d={`M ${-x - (left || 0)} ${y} A ${r} ${r} 0 0 ${bottom ? 0 : 1} ${x + (right || 0)} ${y}`}
            stroke={p("black")}
            strokeWidth="1"
            fill="none"
          />
          <circle
            fill={c(color || "city")}
            stroke={p("black")}
            strokeWidth="1"
            cx={x + (right || 0)}
            cy={y}
            r={radius}
          />
          <circle
            fill={c(color || "city")}
            stroke={p("black")}
            strokeWidth="1"
            cx={-x - (left || 0)}
            cy={y}
            r={radius}
          />
          <text
            fontWeight="bold"
            fontSize={size}
            fontFamily="sans-serif"
            fill={p("black")}
            dominantBaseline={bottom ? "baseline" : "hanging"}
            textAnchor="middle"
            x="0"
            y={ty}
          >
            {label}
          </text>
        </g>
      )}
    </Color>
  );
};

export default Company;
