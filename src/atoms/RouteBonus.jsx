import React from "react";

import Color from "../data/Color";

const RouteBonus = ({ value, size, fillColor, strokeColor, strokeWidth, textColor }) => {
  size = size || 14;
  let width = size * 5.0 / 14.0 * value.length;
  let height = size + 6;
  fillColor = fillColor || "white";
  strokeColor = strokeColor || "black";
  textColor = textColor || "black";
  strokeWidth = strokeWidth || 1;

  return (
    <Color>
      {(c,t,s,p) => (
        <g>
          <polygon
            points={`${-width - 10},0 ${-width},${height*0.5} ${width},${height*0.5} ${width+10},0 ${width},${height*-0.5} ${-width},${height*-0.5}`}
            fill={c(fillColor)}
            stroke={c(strokeColor)}
            strokeWidth={strokeWidth}
          />
          <text
            fontWeight="bold"
            fontSize={size}
            fontFamily="sans-serif"
            fill={c(textColor)}
            dominantBaseline="central"
            textAnchor="middle"
            x="0"
            y="0"
          >
            {value}
          </text>
        </g>
      )}
    </Color>
  );
};

export default RouteBonus;
