import React from "react";
import Color from "../data/Color";

const BgShapes = ({ type, color, width, outlineColor, outlineWidth }) => {
  if (type === "circle") {
    return (
      <Color context="map">
        {c => (
          <g>
            <circle
              cx="0"
              cy="0"
              r={width || 40}
              fill={c(color || "none")}
              stroke={c(outlineColor || "black")}
              strokeWidth={outlineWidth || 1}
            />
          </g>
        )}
      </Color>
    );
  }
};

export default BgShapes;
