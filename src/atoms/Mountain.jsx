import React from "react";
import { colors } from "../data";

const Mountain = ({ size, cost }) => {
  let path;
  let width = 2;
  switch (size) {
    case "large":
      path = "M -45 0 L -30 -15 L -15 0 M 15 0 L 30 -15 L 45 0 M -22.5 -7.5 L 0 -30 L 22.5 -7.5";
      width = 4;
      break;
    case "medium":
      path = "M -30 0 L -20 -10 L -10 0 M 10 0 L 20 -10 L 30 0 M -15 -5 L 0 -20 L 15 -5";
      width = 3;
      break;
    default:
      path = "M -15 0 L -10 -5 L -5 0 M 5 0 L 10 -5 L 15 0 M -7.5 -2.5 L 0 -10 L 7.5 -2.5";
  }

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={colors["mountain"]}
        strokeWidth={width}
        strokeLinecap="round"
        x="0"
        y="0"
      />
      <text
        fill={colors["black"]}
        fontSize="14"
        alignmentBaseline="central"
        textAnchor="middle"
        x="0"
        y="14"
      >
        {cost}
      </text>
    </g>
  );
};

export default Mountain;
