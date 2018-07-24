import React from "react";
import { colors } from "../data";

const Mountain = ({ size, cost, border }) => {
  let path;
  let radius;
  let fontSize;
  let width = 2;

  switch (size) {
    case "large":
      path =
        "M -30 -5 L -20 -15 L -10 -5 M 10 -5 L 20 -15 L 30 -5 M -15 -10 L 0 -25 L 15 -10";
      radius = 40;
      fontSize = 22;
      break;
    case "medium":
      path =
        "M -22.5 -5 L -15 -12.5 L -7.5 -5 M 7.5 -5 L 15 -12.5 L 22.5 -5 M -11.25 -8.75 L 0 -20 L 11.25 -8.75";
      radius = 30;
      fontSize = 18;
      break;
    case "small":
    default:
      radius = 22;
      fontSize = 14;
      path =
        "M -15 -5 L -10 -10 L -5 -5 M 5 -5 L 10 -10 L 15 -5 M -7.5 -7.5 L 0 -15 L 7.5 -7.5";
      break;
    case "tiny":
      radius = 15;
      fontSize = 9;
      path =
        "M -7.5 -5 L -5 -7.5 L -2.5 -5 M 2.5 -5 L 5 -7.5 L 7.5 -5 M -3.75 -6.25 L 0 -10 L 3.75 -6.25";
  }

  if (cost && cost.length > 4) {
    fontSize = fontSize * 0.85;
  }

  return (
    <g>
      {border && (
        <circle
          cx="0"
          cy="0"
          r={radius}
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
      )}
      <path
        d={path}
        fill="none"
        stroke={colors["mountain"]}
        strokeWidth={width}
        strokeLinecap="round"
      />
      <text
        fill={colors["black"]}
        fontSize={fontSize}
        alignmentBaseline="hanging"
        textAnchor="middle"
        x="0"
        y={-5 + fontSize * 0.5}
      >
        {cost}
      </text>
    </g>
  );
};

export default Mountain;
