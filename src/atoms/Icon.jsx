import React from "react";
import { colors } from "../data";

const Value = ({ type }) => {
  let icon;

  switch (type) {
    case "meat":
      icon = (
        <g transform="translate(0 2)">
          <path
            d="M 0 0 c 7 0, 2 -5, 12 -5 C 5 -4, 7 4, 0 4 C -7 4, -5 -4, -12 -5 C -2 -5, -7 0, 0 0"
            fill={colors["mountain"]}
            stroke={colors["mountain"]}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            width="2" height="5" x="-1" y="-0.5"
            fill="black"
            stroke="black"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
      break;
    case "steam":
      icon = (
        <g>
          <path
            d="M 0 -6 L 0 8"
            fill={colors["water"]}
            stroke={colors["water"]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M -9 5 C -7 11, 7 11, 9 5 C 7 9, -7 9, -9 5"
            fill="none"
            stroke={colors["water"]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M -5 -3 L 5 -3"
            fill={colors["water"]}
            stroke={colors["water"]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="0"
            cy="-8"
            r="2"
            fill="none"
            stroke={colors["water"]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
      break;
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
      {icon}
    </g>
  );
};

export default Value;
