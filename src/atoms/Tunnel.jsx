import React from "react";
import Color from "../data/Color";
import PhaseContext from "../context/PhaseContext";
import Currency from "../util/Currency";

const Tunnel = ({ cost, fillColor, strokeColor, strokeWidth, textColor, fontFamily, fontSize, fontWeight }) => {
  fillColor = fillColor || "mountain";
  strokeColor = strokeColor || "black";
  strokeWidth = strokeWidth || "2";
  textColor = textColor || "mountain";
  fontFamily = fontFamily || "display";
  fontSize = fontSize || "12";
  fontWeight = fontWeight || "bold";
  return (
    <PhaseContext.Provider value="default">
      <Color context="map">
        {(c,t) => (
          <g>
            <path
              d="M -22 13 L 0 -24 L 22 13 Z"
              fill={c(fillColor)}
              stroke={c(strokeColor)}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              x="0"
              y="0"
            />
            <text
              fill={textColor ? c(textColor) : t(c("mountain"))}
              fontFamily={fontFamily}
              fontSize={fontSize}
              fontWeight={fontWeight}
              dominantBaseline="hanging"
              textAnchor="middle"
              x="0"
              y="-3"
            >
              <Currency value={cost} type="terrain" />
            </text>
          </g>
        )}
      </Color>
    </PhaseContext.Provider>
  );
};

export default Tunnel;
