import React from "react";
import { colors, textColor, strokeColor } from "./data";

const Token = ({ icon, label, color, labelColor, inverse, outline, width }) => {
  let tokenColor = inverse ? colors["white"] : colors[color];
  let tokenLabelColor = inverse
    ? colors[color]
    : colors[labelColor] || textColor(color);
  let tokenLabelStroke = inverse ? strokeColor(color) : "none";
  let tokenStroke = inverse ? colors[color] : colors[outline] || tokenColor;

  width = width || 25;

  let content = icon ? (
    <use href={icon} transform="scale(1.66666 1.66666)"/>
  ) : (
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
  );

  return (
    <g>
      <circle cx="0" cy="0" r={width} fill={tokenColor} stroke={tokenStroke} />
      {content}
    </g>
  );
};

export default Token;
