import React from "react";
import { colors } from "./data";

const Svg = ({ width, height, viewBox, style, defs, children }) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={viewBox}
      style={style}
    >
      <defs>
        <style>
          @import url("https://fonts.googleapis.com/css?family=Bitter:700");
        </style>
        <clipPath id="hexClip">
          <polygon
            points="-86.6025,0 -43.30125,-75 43.30125,-75 86.6025,0 43.30125,75 -43.30125,75"
            fill="black"
            stroke="black"
            strokeWidth="2"
          />
        </clipPath>
        <g id="meat" transform="translate(0 2)">
          <path
            d="M 0 0 c 7 0, 2 -5, 12 -5 C 5 -4, 7 4, 0 4 C -7 4, -5 -4, -12 -5 C -2 -5, -7 0, 0 0"
            fill={colors["mountain"]}
            stroke={colors["mountain"]}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            width="2"
            height="5"
            x="-1"
            y="-0.5"
            fill="black"
            stroke="black"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <g id="port">
          <path
            d="M 0 -6 L 0 8"
            fill={colors["water"]}
            stroke={colors["water"]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M -9 5 C -7 11, 7 11, 9 5 C 7 9, -7 9, -9 5"
            fill="none"
            stroke={colors["water"]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M -5 -3 L 5 -3"
            fill={colors["water"]}
            stroke={colors["water"]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="0"
            cy="-8"
            r="2"
            fill="none"
            stroke={colors["water"]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <path id="townPath" d="M -30 -15 L 30 -15" />
        <path id="townPathReverse" d="M -30 15 L 30 15" />
        <path id="cityPath" d="M 0 30 A 30 30 0 0 1 0 -30 A 30 30 0 0 1 0 30" />
        <path
          id="cityPathReverse"
          d="M 0 -30 A 30 30 0 0 0 0 30 A 30 30 0 0 0 0 -30"
        />
        {defs}
      </defs>
      {children}
    </svg>
  );
};

export default Svg;
