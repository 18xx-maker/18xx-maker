import React from "react";
import { colors, textColor } from "./data";
import * as R from "ramda";

const Token = ({ label, color, inverse, width }) => {
  let circleColor = inverse ? colors["border"] : color;
  let textColor = inverse ? color : colors["border"];
  width = width || 30

  return (
    <g>
      <circle cx="0" cy="0" r={width} fill={circleColor} stroke={textColor} />
      <text
        textAnchor="middle"
        alignmentBaseline="middle"
        x="0"
        y="0"
        stroke="none"
        font-family="Bitter"
        textLength="40"
        lengthAdjust="spacingAndGlyphs"
        fill={textColor}
      >
        {label}
      </text>
    </g>
  );
};

export default Token;
