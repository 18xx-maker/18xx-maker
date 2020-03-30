import React from "react";
import Color from "../data/Color";
import PhaseContext from "../context/PhaseContext";
import Currency from "../util/Currency";

const Bridge = ({ cost, fillColor, strokeColor, strokeWidth, textColor }) => {
  fillColor = fillColor || "water";
  strokeColor = strokeColor || "track";
  strokeWidth = strokeWidth || "2";
  textColor = textColor || "water";
  return (
    <PhaseContext.Provider value="default">
      <Color context="map">
        {(c,t) => (
          <g>
            <path
              d="M -22 -12 L 0 25 L 22 -12 Z"
              fill={c(fillColor)}
              stroke={c(strokeColor)}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              x="0"
              y="0"
            />
            <text
              fill={t(c(textColor))}
              fontSize="12"
              dominantBaseline="hanging"
              textAnchor="middle"
              x="0"
              y="-7"
            >
              <Currency value={cost} type="terrain" />
            </text>
          </g>
        )}
      </Color>
    </PhaseContext.Provider>
  );
};

export default Bridge;
