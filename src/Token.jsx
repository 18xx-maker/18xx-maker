import React from "react";
import Color from "./data/Color";

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
  width = width || 25;

  let content = icon ? (
    <use href={icon} transform="scale(1.66666 1.66666)" />
  ) : (
    <Color>
      {(c,t,s) => (
        <text
          fontFamily="Bitter"
          fontSize={width * 0.64}
          textAnchor="middle"
          alignmentBaseline="central"
          strokeWidth="0.5"
          stroke={inverse ? s(c(color)) : "none"}
          fill={inverse ? c(color) : (c(labelColor) || t(c(color)))}
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
      )}
    </Color>
  );

  return (
    <Color>
      {(c,t,s) => (
        <g>
          <circle
            cx="0"
            cy="0"
            r={width + (bleed ? 5 : 0)}
            fill={inverse ? c("white") : (c(color) || c("white"))}
            stroke={inverse ? c(color) : c("black")}
          />
          {content}
        </g>
      )}
    </Color>
  );
};

export default Token;
