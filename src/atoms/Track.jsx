import React from "react";
import { colors } from "../data";

import HexContext from "../context/HexContext";

const Track = ({ type, gauge, border }) => {
  let path;

  switch (type) {
    case "stop":
      path = "m 0 75 L 0 37.5";
      break;
    case "straight":
      path = "m 0 75 L 0 -75";
      break;
    case "gentle":
      path = `m 0 75 A 129.90375 129.90375 0 0 0 -64.951875 -37.5`;
      break;
    case "sharp":
      path = `m 0 75 A 43.30125 43.30125 0 0 0 -64.951875 37.5`;
      break;
    case "bent":
      path = "m 0 75 C 0 30, 40 40, 40 0 C 40 -40, 0 -30, 0 -75";
      break;
    default:
      path = "m 0 75 L 0 0";
      break;
  }

  let width = border ? 14 : 10;
  let color = border ? colors["border"] : colors["track"];

  // Gauge
  let strokeDashArray = "none";
  if (gauge === "narrow") {
    strokeDashArray = `${width},${width}`;
  }

  // Double Guage
  let double = null;
  if (!border && gauge === "double") {
    double = (
      <path
        d={path}
        fill="none"
        stroke={colors["border"]}
        strokeLinecap="butt"
        strokeLinejoin="bevel"
        strokeWidth={width - 4}
        strokeDasharray={strokeDashArray}
      />
    );
  }

  // Track
  return (
    <HexContext.Consumer>
      {hx => (
        <g transform={`rotate(${hx.rotation})`}>
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeLinecap="butt"
            strokeLinejoin="bevel"
            strokeWidth={width}
            strokeDasharray={strokeDashArray}
          />
          {double}
        </g>
      )}
    </HexContext.Consumer>
  );
};

export default Track;
