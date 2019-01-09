import React from "react";
import { colors } from "../data";

import HexContext from "../context/HexContext";

const Track = ({ type, gauge, border, offset }) => {
  let width = border ? 16 : 12;
  let color = border ? colors["border"] : colors["track"];
  let path;

  switch (type) {
  case "offboard":
    let end = border ? 30:40;
    width = border ? 8 : 6;
    path = `M${width},75 -${width},75 0,${end}z`;
    break;
  case "1860-C":
    path = "m 0 75 C 0 50, 30 50, 45 25";
    break;
  case "stub":
    path = "m 0 75 L 0 56.25";
    break;
  case "stop":
    path = "m 0 75 L 0 37.5";
    break;
  case "mid":
    path = "m 0 0 L 0 37.5";
    break;
  case "straight":
    path = "m 0 75 L 0 -75";
    break;
  case "straightStop":
    path = "m 0 75 L 0 -37.5";
    break;
  case "gentle":
    path = `m 0 75 A 129.90375 129.90375 0 0 0 -64.951875 -37.5`;
    break;
  case "gentleStop":
    path = `m 0 75 A 129.90375 129.90375 0 0 0 -38.047927473438027 -16.855822526561973`;
    break;
  case "gentleStopRev":
    path = `m 0 75 A 129.90375 129.90375 0 0 1 38.047927473438027 -16.855822526561973`;
    break;
  case "lawson":
    path = "m 0 75 L 0 0 L -64.951875 -37.5";
    break;
  case "sharp":
    path = `m 0 75 A 43.30125 43.30125 0 0 0 -64.951875 37.5`;
    break;
  case "sharpStop":
    path = `m 0 75 A 43.30125 43.30125 0 0 0 -21.650625 37.5`;
    break;
  case "sharpStopRev":
    path = `m 0 75 A 43.30125 43.30125 0 0 1 21.650625 37.5`;
    break;
  case "bent":
    path = "m 0 75 C 0 30, 40 40, 40 0 C 40 -40, 0 -30, 0 -75";
    break;
  default:
    path = "m 0 75 L 0 0";
    break;
  }

  // Gauge
  let strokeDashArray = "none";
  let strokeDashOffset = "none";
  if (!border && gauge === "narrow") {
    strokeDashArray = `${width}`;
    if (offset) {
      strokeDashOffset = `${offset}`;
    }
  }

  // Line Gauge
  if (gauge === "line") {
    width = border ? 6 : 2;
  }

  // Double Gauge
  let double = null;
  if (!border && gauge === "double") {
    double = (
      <path
        d={path}
        fill="none"
        stroke={colors["border"]}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeWidth={width - 4}
        strokeDasharray={strokeDashArray}
        strokeDashoffset={strokeDashOffset}
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
            fill={type === "offboard" ? color : "none"}
            stroke={type === "offboard" ? "none" : color}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeWidth={width}
            strokeDasharray={strokeDashArray}
            strokeDashoffset={strokeDashOffset}
          />
          {double}
        </g>
      )}
    </HexContext.Consumer>
  );
};

export default Track;
