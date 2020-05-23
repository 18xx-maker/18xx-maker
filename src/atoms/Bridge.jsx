import React from "react";
import Color from "../data/Color";
import PhaseContext from "../context/PhaseContext";
import Currency from "../util/Currency";

const Bridge = ({ cost, fillColor, fillOpacity, strokeColor, strokeWidth, textColor, fontFamily, fontSize, fontWeight, width, strokeDashArray }) => {
  fillColor = fillColor || "water";
  strokeColor = strokeColor || "track";
  strokeWidth = strokeWidth || "2";
  textColor = textColor || "water";
  fontFamily = fontFamily || "display";
  fontSize = fontSize || "12";
  fontWeight = fontWeight || "bold";
  strokeDashArray = strokeDashArray || "";
  fillOpacity = fillOpacity || "1";
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
                fill-opacity={fillOpacity}
                stroke-dasharray={strokeDashArray}
                strokeLinecap="round"
                x="0"
                y="0"
              />
            </g>
            <text
              fill={textColor ? c(textColor) : t(c("water"))}
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
