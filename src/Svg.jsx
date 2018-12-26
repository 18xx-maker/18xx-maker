import React from "react";
import { colors } from "./data";

const Svg = ({ className, width, height, viewBox, style, defs, children }) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={viewBox}
      style={style}
      className={className}
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
        <g id="mountain60">
          <path
            d="M -15 -5 L -10 -10 L -5 -5 M 5 -5 L 10 -10 L 15 -5 M -7.5 -7.5 L 0 -15 L 7.5 -7.5"
            fill="none"
            stroke={colors["mountain"]}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text
            fill={colors["black"]}
            fontSize="10"
            alignmentBaseline="hanging"
            textAnchor="middle"
            x="0"
            y="0"
          >
            £60
          </text>
        </g>
        <g id="mountain120">
          <path
            d="M -15 -5 L -10 -10 L -5 -5 M 5 -5 L 10 -10 L 15 -5 M -7.5 -7.5 L 0 -15 L 7.5 -7.5"
            fill="none"
            stroke={colors["mountain"]}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text
            fill={colors["black"]}
            fontSize="14"
            alignmentBaseline="hanging"
            textAnchor="middle"
            x="0"
            y="-5"
          >
            £120
          </text>
        </g>
        <path id="cityPath" d="M 0 30 A 30 30 0 0 1 0 -30 A 30 30 0 0 1 0 30" />
        <path
          id="cityPathReverse"
          d="M 0 -30 A 30 30 0 0 0 0 30 A 30 30 0 0 0 0 -30"
        />
        <path
          id="city2Path"
          d="M 0 30 L -25 30 A 30 30 0 0 1 -25 -30 L 25 -30 A 30 30 0 0 1 25 30 L 0 30"
        />
        <path
          id="city2PathReverse"
          d="M 0 -30 L -25 -30 A 30 30 0 0 0 -25 30 L 25 30 A 30 30 0 0 0 25 -30 L 0 -30"
        />
        <path
          id="city3Path"
          d="M 0 42 L -25 42 A 30 30 0 0 1 -47 -1 L -25 -40 A 30 30 0 0 1 25 -40 L 47 -1 A 30 30 0 0 1 25 42 L 0 42"
        />
        <path
          id="city3PathReverse"
          d="M 0 42 L 25 42 A 30 30 0 0 0 47 -1 L 25 -40 A 30 30 0 0 0 -25 -40 L -47 -1 A 30 30 0 0 0 -25 42 L 0 42"
        />
        {defs}
      </defs>
      {children}
    </svg>
  );
};

export default Svg;
