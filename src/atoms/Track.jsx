import React from "react";
import Color from "../data/Color";

import HexContext from "../context/HexContext";

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
  case "lawson":
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

const Track = ({ type, gauge, border, offset, path }) => {
  let width = border ? 16 : 12;

  switch (type) {
  case "custom":
    break;
  case "offboard":
    let end = border ? 30:40;
    width = border ? 8 : 6;
    path = `M${width} 75 L ${width} 85 L -${width} 85 L -${width} 75 L 0 ${end} Z`;
    break;
  case "stub":
    path = "m 0 85 L 0 56.25";
    break;
  case "stop":
    path = "m 0 85 L 0 37.5";
    break;
  case "mid":
    path = "m 0 0 L 0 37.5";
    break;
  case "straight":
    path = "m 0 85 L 0 -85";
    break;
  case "straightStop":
    path = "m 0 85 L 0 -37.5";
    break;
  case "gentle":
    path = `m 0 85 L 0 75 A 129.90375 129.90375 0 0 0 -64.951875 -37.5 L -73.612125 -42.5`;
    break;
  case "gentleStop":
    path = `m 0 85 L 0 75 A 129.90375 129.90375 0 0 0 -38.047927473438027 -16.855822526561973`;
    break;
  case "gentleStopRev":
    path = `m 0 85 L 0 75 A 129.90375 129.90375 0 0 1 38.047927473438027 -16.855822526561973`;
    break;
  case "lawson":
    path = "m 0 85 L 0 0 L -73.612125 -42.5";
    break;
  case "sharp":
    path = `m 0 85 L 0 75 A 43.30125 43.30125 0 0 0 -64.951875 37.5 L -73.612125 42.5`;
    break;
  case "sharpStop":
    path = `m 0 85 L 0 75 A 43.30125 43.30125 0 0 0 -21.650625 37.5`;
    break;
  case "sharpStopRev":
    path = `m 0 85 L 0 75 A 43.30125 43.30125 0 0 1 21.650625 37.5`;
    break;
  case "bent":
    path = "m 0 85 L 0 75 C 0 30, 40 40, 40 0 C 40 -40, 0 -30, 0 -75 L 0 -85";
    break;
  default:
    path = "m 0 85 L 0 0";
    break;
  }

  // Gauge
  let strokeDashArray = "none";
  let strokeDashOffset = "none";
  let narrow = null;
  if (!border && gauge === "narrow") {
    strokeDashArray = `${width * 0.75}`;
    if (offset) {
      strokeDashOffset = `${offset}`;
    }
    narrow = (
      <Color>
        {c => (
          <path
            d={path}
            fill="none"
            stroke={c("white")}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeWidth={width - 4}
            strokeDasharray={strokeDashArray}
            strokeDashoffset={strokeDashOffset}
          />
        )}
      </Color>
    );
  }

  // Line Gauge
  if (gauge === "line") {
    width = border ? 6 : 2;
  }

  // Double Gauge
  let double = null;
  if (!border && gauge === "double") {
    double = (
      <Color>
        {c => (
          <path
            d={path}
            fill="none"
            stroke={c("white")}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeWidth={width - 4}
          />
        )}
      </Color>
    );
  }

  // Track
  return (
    <Color>
      {c => (
        <HexContext.Consumer>
          {hx => (
            <g transform={`rotate(${hx.rotation})`}>
              <path
                d={path}
                fill={type === "offboard" ? (c(border ? "border" : "track")) : "none"}
                stroke={type === "offboard" ? "none" : (c(border ? "border" : "track"))}
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeWidth={width}
              />
              {narrow}
              {double}
            </g>
          )}
        </HexContext.Consumer>
      )}
    </Color>
  );
};

export default Track;
