import React from "react";
import util from "./util";

const Track = ({ track, width, x, y, strokeWidth, color }) => {
  let data = util.hexData(width, true, x, y);
  let { start, end, cross, gauge } = track;
  let diff =
    end === undefined ? 0 : start > end ? end + 6 - start : end - start;

  // Points
  let startPoint = `${data.sides[start-1][0]} ${data.sides[start-1][1]}`;
  let endPoint = "0";
  if (end) {
    endPoint = `${data.sides[end-1][0]} ${data.sides[end-1][1]}`;
  }

  // Gauge
  let strokeDashArray = "none";
  if (gauge === "narrow") {
    strokeDashArray = `${width},${width}`;
  }

  let path = `m ${startPoint} L ${x} ${y}`;
  let radius = data.edge * 0.5;
  switch (diff) {
    case 1:
      path = `m ${startPoint} A ${radius} ${radius} 0 0 0 ${endPoint}`;
      break;
    case 2:
      radius = data.edge * 1.5;
      path = `m ${startPoint} A ${radius} ${radius} 0 0 0 ${endPoint}`;
      break;
    case 3:
      path = `m ${startPoint} L ${endPoint}`;
      break;
  }

  // Track Border
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
