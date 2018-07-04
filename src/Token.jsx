import React from "react";
import { colors } from "./data";
import * as R from "ramda";

const Token = ({ label, color, labelColor, inverse, width }) => {
  labelColor = labelColor || colors["white"];
  let circleColor = inverse ? colors["white"] : color;
  let textColor = inverse ? colors["black"] : labelColor;
  let strokeColor = color;
  width = width || 30;

  return (
    <g>
      <circle
        cx="0"
        cy="0"
        r={width}
        fill={circleColor}
        stroke={color}
      />
      <text
        textAnchor="middle"
        alignmentBaseline="middle"
        x="0"
        y="0"
        strokeWidth="none"
        stroke="none"
        font-family="Bitter"
        textLength={40}
        lengthAdjust="spacingAndGlyphs"
        fill={textColor}
      >
        {label}
      </text>
    </g>
  );
};

export default Token;
