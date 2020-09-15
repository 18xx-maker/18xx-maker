import React from "react";
import Color from "../util/Color";
import { useOrientation } from "../context/OrientationContext";

import chain from "ramda/src/chain";
import compose from "ramda/src/compose";
import defaultTo from "ramda/src/defaultTo";
import propOr from "ramda/src/propOr";
import sort from "ramda/src/sort";
import subtract from "ramda/src/subtract";
import uniq from "ramda/src/uniq";

const sideMod = side => {
  return side > 6 ? side - 6 : side;
};

export const sidesFromTrack = track => {
  if (!track) {
    return [];
  }

  let side = track.side || 1;

  switch(track.type) {
    case "custom":
      return propOr([], "sides", track);
    case "mid":
      return [];
    case "sharp":
      return [side, sideMod(side + 1)];
    case "gentle":
      return [side, sideMod(side + 2)];
    case "straight":
    case "bent":
      return [side, sideMod(side + 3)];
    case "offboard":
    case "stub":
    case "stop":
    case "straightStop":
    case "gentleStop":
    case "gentleStopRev":
    case "sharpStop":
    case "sharpStopRev":
    default:
      return [side];
  }
};

export const sidesFromTile = compose(uniq,
                                     sort(subtract),
                                     chain(sidesFromTrack),
                                     propOr([], "track"),
                                     defaultTo([]));

const startEndDeprecated = (type, replace, end, start) => {
  console.log(`Track type "${type}" is currently deprecated. The same effect can be made with the new "start" and "end" fields on track: {"type": "${replace}"${start ? `, "start": ${start}` : ""}${end ? `, "end": ${end}` : ""}}`);
}

const SIXTY_DEGREES = 60 * Math.PI / 180; // Into Radians
const ONE_TWENTY_DEGREES = 120 * Math.PI / 180; // Into Radians

const sharpPosition = (percent) => {
  let angle = percent * ONE_TWENTY_DEGREES;
  let x = -43.30125 + (43.31025 * Math.cos(angle));
  let y = 75 - (43.31025 * Math.sin(angle));
  return [x, y];
}

const sharpPath = (start, end) => {
  let pathStart = "m 0 85 L 0 75";
  if (start > 0) {
    let [startX, startY] = sharpPosition(start);
    pathStart = `m ${startX} ${startY}`;
  }
  let pathEnd = "-64.951875 37.5 L -73.612125 42.5";
  if (end < 1) {
    let [endX, endY] = sharpPosition(end);
    pathEnd = `${endX} ${endY}`
  }

  return `${pathStart} A 43.30125 43.30125 0 0 0 ${pathEnd}`;
  // `m 0 85 L 0 75 A 43.30125 43.30125 0 0 0 -64.951875 37.5 L -73.612125 42.5`;
};

const gentlePosition = (percent) => {
  let angle = percent * SIXTY_DEGREES
  let x = -129.90375 + (129.90375 * Math.cos(angle));
  let y = 75 - (129.90375 * Math.sin(angle));
  return [x, y];
};

const gentlePath = (start, end) => {
  let pathStart = "m 0 85 L 0 75";
  if (start > 0) {
    let [startX, startY] = gentlePosition(start);
    pathStart = `m ${startX} ${startY}`;
  }
  let pathEnd = "-64.951875 -37.5 L -73.612125 -42.5";
  if (end < 1) {
    let [endX, endY] = gentlePosition(end);
    pathEnd = `${endX} ${endY}`
  }

  return `${pathStart} A 129.90375 129.90375 0 0 0 ${pathEnd}`;
};

const straightPath = (start, end) => {
  let pathStart = "m 0 85 L 0 75";
  if (start > 0) {
    pathStart = `m 0 ${75 - (start * 150)}`;
  }
  let pathEnd = "L 0 -75 L 0 -85";
  if (end < 1) {
    pathEnd = `L 0 ${-75 + ((1 - end) * 150)}`
  }
  return `${pathStart} ${pathEnd}`;
};

const Track = ({ type, gauge, border, width, offset, path, color,
                 start = 0,
                 end = 1,
                 borderColor, gaugeColor }) => {
  const rotation = useOrientation();

  let trackWidth = defaultTo(12, width);
  if (border)
    trackWidth += 4;
  color = color || "track";
  borderColor = borderColor || "border";
  gaugeColor = gaugeColor || "white";

  switch (type) {
    case "custom":
      break;
    case "offboard":
      let offboardEnd = border ? 40 : 48;
      trackWidth = border ? 8 : 6;
      path = `M${trackWidth} 75 L ${trackWidth} 85 L -${trackWidth} 85 L -${trackWidth} 75 L 0 ${offboardEnd} Z`;
      break;
    case "stub":
      // deprecated
      startEndDeprecated("stub", "straight", 0.125);
      path = "m 0 85 L 0 56.25";
      break;
    case "stop":
      // deprecated
      startEndDeprecated("stop", "straight", 0.25);
      path = "m 0 85 L 0 37.5";
      break;
    case "mid":
      // deprecated
      startEndDeprecated("mid", "straight", 0.5, 0.25);
      path = "m 0 0 L 0 37.5";
      break;
    case "straightGentleHalf":
      // deprecated
      startEndDeprecated("straightGentleHalf", "straight", 0.3667);
      path = "m 0 85 L 0 20";
      break;
    case "straight":
      path = straightPath(start, end);
      break;
    case "straightStop":
      // deprecated
      startEndDeprecated("straightStop", "straight", 0.75);
      path = "m 0 85 L 0 -37.5";
      break;
    case "gentle":
      path = gentlePath(start, end);
      break;
    case "gentleHalf":
      // deprecated
      startEndDeprecated("gentleHalf", "gentle", 0.5);
      path = `m 0 85 L 0 75 A 129.90375 129.90375 0 0 0 -15 15`;
      break;
    case "gentleStop":
      // deprecated
      startEndDeprecated("gentleStop", "gentle", 0.75);
      path = `m 0 85 L 0 75 A 129.90375 129.90375 0 0 0 -38.047927473438027 -16.855822526561973`;
      break;
    case "gentleHalfRev":
      // deprecated
      startEndDeprecated("gentleHalfRev", "gentle", 0.5);
      path = `m 0 85 L 0 75 A 129.90375 129.90375 0 0 1 15 15`;
      break;
    case "gentleStopRev":
      // deprecated
      startEndDeprecated("gentleStopRev", "gentle", 1, 0.25);
      path = `m 0 85 L 0 75 A 129.90375 129.90375 0 0 1 38.047927473438027 -16.855822526561973`;
      break;
    case "sharp":
      path = sharpPath(start, end);
      break;
    case "sharpStop":
      // deprecated
      startEndDeprecated("sharpStop", "sharp", 0.5);
      path = `m 0 85 L 0 75 A 43.30125 43.30125 0 0 0 -21.650625 37.5`;
      break;
    case "sharpStopRev":
      // deprecated
      startEndDeprecated("sharpStopRev", "sharp", 1, 0.5);
      path = `m 0 85 L 0 75 A 43.30125 43.30125 0 0 1 21.650625 37.5`;
      break;
    case "bent":
      path = "m 0 85 L 0 75 C 0 30, 40 40, 40 0 C 40 -40, 0 -30, 0 -75 L 0 -85";
      break;
    default:
      path = `m 0 85 L 0 -${(trackWidth / 4) + 0.5}`;
      break;
  }

  // Gauge
  let strokeDashArray = "none";
  let strokeDashOffset = "none";
  let narrow = null;
  if (!border && (gauge === "narrow" || gauge === "dashed")) {
    strokeDashArray = `${trackWidth * 0.75}`;
    if (offset) {
      strokeDashOffset = `${offset}`;
    }
    narrow = (
      <Color>
        {c => (
          <path
            d={path}
            fill="none"
            stroke={c(gaugeColor)}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeWidth={trackWidth - 4}
            strokeDasharray={strokeDashArray}
            strokeDashoffset={strokeDashOffset}
          />
        )}
      </Color>
    );
  }

  // Line Gauge
  if (gauge === "line" || gauge === "dashed") {
    trackWidth = border ? 6 : 2;
  }

  // Dual Gauge
  let dual = null;
  if (!border && gauge === "dual") {
    dual = (
      <Color>
        {c => (
          <path
            d={path}
            fill={type === "offboard" ? c(gaugeColor) : "none"}
            stroke={type === "offboard" ? "none" : c(gaugeColor)}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeWidth={trackWidth - 4}
          />
        )}
      </Color>
    );
  }

  // Track
  return (
    <Color>
      {c => (
        <g transform={`rotate(${rotation})`}>
          <path
            d={path}
            fill={type === "offboard" ? (c(border ? borderColor : color)) : "none"}
            stroke={type === "offboard" ? "none" : (c(border ? borderColor : color))}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeWidth={trackWidth}
          />
          {narrow}
          {dual}
        </g>
      )}
    </Color>
  );
};

export default Track;
