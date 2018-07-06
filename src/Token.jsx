import React from "react";
import { colors, textColor, strokeColor } from "./data";
import * as R from "ramda";

const Token = ({ label, color, labelColor, inverse, width }) => {
  let tokenColor = inverse ? colors["white"] : colors[color];
  let tokenLabelColor = inverse ? colors[color] : colors[labelColor] || textColor(color);
  let tokenLabelStroke = inverse ? strokeColor(color) : "none";

  width = width || 25;

  return (
    <g>
      <circle
        cx="0"
        cy="0"
        r={width}
        fill={tokenColor}
        stroke={colors[color]}
      />
      <text
        font-family="Bitter"
        textAnchor="middle"
        alignmentBaseline="central"
        stroke-width="0.5"
        stroke={tokenLabelStroke}
        fill={tokenLabelColor}
        textLength={40}
        lengthAdjust="spacingAndGlyphs"
        x="0"
        y="0"
      >
        {label}
      </text>
    </g>
  );
};

export default Token;
