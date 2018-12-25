import React from "react";
import { colors, textColor, strokeColor } from "./data";

const Token = ({
  icon,
  label,
  color,
  labelColor,
  inverse,
  outline,
  width,
  bleed
}) => {
  let tokenColor = inverse ? colors["white"] : colors[color];
  let tokenLabelColor = inverse
    ? colors[color]
    : colors[labelColor] || textColor(color);
  let tokenLabelStroke = inverse ? strokeColor(color) : "none";
  let tokenStroke = inverse ? colors[color] : colors[outline] || colors["white"];

  width = width || 25;

  let content = icon ? (
    <use href={icon} transform="scale(1.66666 1.66666)" />
  ) : (
    <text
      fontFamily="Bitter"
      fontSize={width * 0.64}
      textAnchor="middle"
      alignmentBaseline="central"
      strokeWidth="0.5"
      stroke={tokenLabelStroke}
      fill={tokenLabelColor}
      textLength={
        label.length > 2
          ? width * 2 - width * 0.4
          : label.length === 1
            ? width * 0.5
            : width
      }
      lengthAdjust="spacingAndGlyphs"
      x="0"
      y="0"
    >
      {label}
    </text>
  );

  return (
    <g>
      <circle
        cx="0"
        cy="0"
        r={width + (bleed ? 5 : 0)}
        fill={tokenColor}
        stroke={tokenStroke}
      />
      {content}
    </g>
  );
};

export default Token;
