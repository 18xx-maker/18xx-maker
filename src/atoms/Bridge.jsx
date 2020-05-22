import React from "react";
import Color from "../data/Color";
import PhaseContext from "../context/PhaseContext";
import Currency from "../util/Currency";

const Bridge = ({ cost, fillColor, strokeColor, strokeWidth, textColor, fontFamily, fontSize, fontWeight, width }) => {
  fillColor = fillColor || "water";
  strokeColor = strokeColor || "track";
  strokeWidth = strokeWidth >= 0 ? strokeWidth : "1";
  fontFamily = fontFamily || "display";
  fontSize = fontSize || "12";
  fontWeight = fontWeight || "bold";
  let scale = width !== 0 ? width / 22 : 22;
  return (
    <PhaseContext.Provider value="default">
      <Color context="map">
        {(c,t) => (
          <g>
            <g transform={`scale(${scale})`}>
              <path
                d="M -22 -12 L 0 25 L 22 -12 Z"
                fill={c(fillColor)}
                stroke={c(strokeColor)}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                x="0"
                y="0"
              />
            </g>
            <text
              fill={textColor ? c(textColor) : t(c(fillColor))}
              fontFamily={fontFamily}
              fontSize={fontSize}
              fontWeight={fontWeight}
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
