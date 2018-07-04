import React from "react";
import util from "./util";

const Track = ({ track, width, x, y, strokeWidth, color }) => {
  let data = util.hexData(width, true, x, y);
  let { start, end, cross, gauge } = track;

  let path;
  let radius = data.edge * 0.5;

  // Path
  if (start === undefined && end === undefined) {
    return null;
  } else if (end === undefined) {
    // Strait from edge to center
    let startPoint = `${data.sides[start - 1][0]} ${data.sides[start - 1][1]}`;
    path = `m ${startPoint} L ${x} ${y}`;
  } else if (start === undefined) {
    // Half line from edge to nothing
    let stop = util.linear(
      0.5,
      [data.sides[end - 1][0], data.sides[end - 1][1]],
      [x, y]
    );
    let endPoint = `${data.sides[end - 1][0]} ${data.sides[end - 1][1]}`;
    let stopPoint = `${stop[0]} ${stop[1]}`;

    path = `m ${endPoint} L ${stopPoint}`;
  } else {
    // track from one side to another
    let startPoint = `${data.sides[start - 1][0]} ${data.sides[start - 1][1]}`;
    let endPoint = `${data.sides[end - 1][0]} ${data.sides[end - 1][1]}`;
    let type = util.trackType(track);

    switch (type) {
      case "sharp":
        path = `m ${startPoint} A ${radius} ${radius} 0 0 0 ${endPoint}`;
        break;
      case "gentle":
        radius = data.edge * 1.5;
        path = `m ${startPoint} A ${radius} ${radius} 0 0 0 ${endPoint}`;
        break;
      case "straight":
        path = `m ${startPoint} L ${endPoint}`;
        break;
    }
  }

  // Gauge
  let strokeDashArray = "none";
  if (gauge === "narrow") {
    strokeDashArray = `${width},${width}`;
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
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDashArray}
      />
    </g>
  );
};

export default Track;
