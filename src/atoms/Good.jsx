import React from "react";
import Color from "../data/Color";

const Good = ({ color, width }) => {
  color = color || "white";
  width = width || 40;

  return (
    <Color context="companies">
      {c => (
        <g>
          <rect
            fill={c(color)}
            stroke={c("track")}
            strokeWidth="2"
            x={-0.5 * width} y={-0.5 * width}
            width={width} height={width} />
        </g>
      )}
    </Color>
  );
};

export default Good;
