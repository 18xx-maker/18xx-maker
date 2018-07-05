import React from "react";
import { colors, companies } from "./data";
import * as R from "ramda";

const Token = ({ label, color, labelColor, inverse, width }) => {
  labelColor = companies[labelColor] || colors["white"];
  let circleColor = inverse ? colors["white"] : companies[color];
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
        stroke={companies[color]}
      />
      <text
        textAnchor="middle"
        alignmentBaseline="central"
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
