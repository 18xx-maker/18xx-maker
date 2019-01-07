import React from "react";
import { colors } from "../data";

const Good = ({ color, width }) => {
  color = color || "white";
  width = width || 40;

  return (
    <g>
      <rect
        fill={colors[color]}
        stroke={colors["track"]}
        strokeWidth="2"
        x={-0.5 * width} y={-0.5 * width}
        width={width} height={width} />
    </g>
  );
};

export default Good;
