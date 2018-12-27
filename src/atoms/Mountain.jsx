import React from "react";
import { colors } from "../data";

const Mountain = ({ cost }) => {
  let fontSize = 15;
  let width = 2;
  let path =
        "M -15 -5 L -10 -10 L -5 -5 M 5 -5 L 10 -10 L 15 -5 M -7.5 -7.5 L 0 -15 L 7.5 -7.5";

  return (
    <g>
      <path
        transform="translate(0 1)"
        d={path}
        fill="none"
        stroke={colors["white"]}
        strokeWidth={width}
        strokeLinecap="round"
      />
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
        y="0"
      >
        {cost}
      </text>
    </g>
  );
};

export default Mountain;
