import React from "react";
import { colors } from "../data";

const Track = ({ type, gauge, border }) => {
  let path;

  switch (type) {
    case "stop":
      path = "m -75 0 L -37.5 0";
      break;
    case "city":
      path = "m -75 0 L 0 0";
      break;
    case "straight":
      path = "m -75 0 L 75 0";
      break;
    case "gentle":
      path = `m -75 0 A 129.90375 129.90375 0 0 0 37.5 -64.951875`;
      break;
    case "sharp":
      path = `m -75 0 A 43.30125 43.30125 0 0 0 -37.5 -64.951875`;
      break;
    case "bent":
      path = "m -75 0 C -30 0, -30 40, 0 40 C 30 40, 30 0, 75 0";
      break;
    default:
      return null;
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
    <g>
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
  );
};

export default Track;
