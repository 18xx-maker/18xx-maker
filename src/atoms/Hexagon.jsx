import React from "react";
import Color from "../data/Color";
import PhaseContext from "../context/PhaseContext";
import Currency from "../util/Currency";

const Hexagon = ({ cost, fillColor, fillOpacity, strokeColor, strokeWidth, textColor, fontFamily, fontSize, fontWeight, width, strokeDashArray }) => {
  fillColor = fillColor || "mountain";
  strokeColor = strokeColor || "black";
  strokeWidth = strokeWidth >= 0 ? strokeWidth : "1";
  fontFamily = fontFamily || "display";
  fontSize = fontSize || "12";
  fontWeight = fontWeight || "bold";
  strokeDashArray = strokeDashArray || "";
  fillOpacity = fillOpacity || "1";
  let scale = width !== 0 ? width / 22 : 22;
  let texty = -5 - (fontSize-12)/6;
  return (
    <PhaseContext.Provider value="default">
      <Color context="map">
        {(c,t) => (
          <g>
            <g transform={`scale(${scale})`}>
              <path
                d="M -22 0 L -11 -19.0525588833 L 11 -19.0525588833 L 22 0 L 11 19.0525588833 L -11 19.0525588833 L -22 0"
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
              fill={textColor ? c(textColor) : t(c(fillColor))}
              fontFamily={fontFamily}
              fontSize={fontSize}
              fontWeight={fontWeight}
              dominantBaseline="hanging"
              textAnchor="middle"
              x="-2"
              y={texty}
            >
              <Currency value={cost} type="terrain" />
            </text>
          </g>
        )}
      </Color>
    </PhaseContext.Provider>
  );
};

export default Hexagon;
