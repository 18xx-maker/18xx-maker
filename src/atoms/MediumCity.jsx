import React from "react";

import defaultTo from "ramda/src/defaultTo";

import Color from "../data/Color";
import Name from "./Name";

const MediumCity = ({ border, name, reverse, color, fillColor, fillOpacity, strokeColor, strokeWidth, width, strokeDashArray, outlineColor, outlineStroke, outlineStrokeWidth }) => {
  fillColor = fillColor || color || "track";
  strokeColor = strokeColor || "black";
  strokeWidth = strokeWidth >= 0 ? strokeWidth : "1";
  strokeDashArray = strokeDashArray || "";
  fillOpacity = fillOpacity || "1";
  outlineColor = outlineColor || "border";
  outlineStroke = outlineStroke || "track";
  outlineStrokeWidth = outlineStrokeWidth || "3";
  let scale = defaultTo(22, width) / 22;
  if (border) {
    return (
      <Color>
        {c => (
          <g transform={`scale(${scale})`}>
            <circle fill={c("border")} stroke="none" cx="0" cy="0" r="21" />
          </g>
        )}
      </Color>
    );
  } else {
    let nameNode = null;

    if (name) {
      nameNode = (
        <Name
          {...name}
          y={name.y || (name.reverse ? 25 : -25)}
        />
      );
    }

    return (
      <Color context="companies">
        {c => (
          <g transform={`scale(${scale})`}>
            <circle
              fill={c(outlineColor)}
              stroke={c(outlineStroke)}
              strokeWidth={outlineStrokeWidth}
              cx="0"
              cy="0"
              r="17"
            />
            <circle
              fill={c(fillColor)}
              fillOpacity={fillOpacity}
              stroke={c(strokeColor)}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDashArray}
              cx="0"
              cy="0"
              r="12"
            />
            {nameNode}
          </g>
        )}
      </Color>
    );
  }
};

export default MediumCity;
