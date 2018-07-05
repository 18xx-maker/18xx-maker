import React from "react";
import { colors } from "../data";

const City = ({ size, border }) => {
  if (size === 1) {
    if (border) {
      return (
        <circle fill={colors["border"]} stroke="none" cx="0" cy="0" r="28" />
      );
    } else {
      return (
        <circle
          fill={colors["border"]}
          stroke={colors["track"]}
          strokeWidth="2"
          cx="0"
          cy="0"
          r="25"
        />
      );
    }
  } else if (size === 2) {
    if (border) {
      return (
        <polygon
          points="-25,0 25,0"
          fill={colors["border"]}
          stroke={colors["border"]}
          strokeWidth="56"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      );
    } else {
      return (
        <g>
          <polygon
            points="-25,-25, 25,-25 25,25 -25,25"
            fill={colors["border"]}
            stroke={colors["track"]}
            strokeWidth="2"
          />
          <circle
            fill={colors["border"]}
            stroke={colors["track"]}
            strokeWidth="2"
            cx="-25"
            cy="0"
            r="25"
          />
          <circle
            fill={colors["border"]}
            stroke={colors["track"]}
            strokeWidth="2"
            cx="25"
            cy="0"
            r="25"
          />
        </g>
      );
    }
  } else if (size === 3) {
    if (border) {
      return (
        <polygon
          points="0,-29 25,15 -25,15"
          fill={colors["border"]}
          stroke={colors["border"]}
          strokeWidth="56"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      );
    } else {
      return (
        <g>
          <polygon
            points="-21,-42, 21,-42 45,-1 25,40 -25,40 -45,-1"
            fill={colors["border"]}
            stroke={colors["track"]}
            strokeWidth="2"
          />
          <circle
            fill={colors["border"]}
            stroke={colors["track"]}
            strokeWidth="2"
            cx="0"
            cy="-29"
            r="25"
          />
          <circle
            fill={colors["border"]}
            stroke={colors["track"]}
            strokeWidth="2"
            cx="-25"
            cy="15"
            r="25"
          />
          <circle
            fill={colors["border"]}
            stroke={colors["track"]}
            strokeWidth="2"
            cx="25"
            cy="15"
            r="25"
          />
        </g>
      );
    }
  } else if (size === 4) {
    if (border) {
      return (
        <polygon
          points="-25,-25 25,-25 25,25 -25,25"
          fill={colors["border"]}
          stroke={colors["border"]}
          strokeWidth="56"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      );
    } else {
      return (
        <g>
          <polygon
            points="-25,-50, 25,-50 50,-25 50,25 25,50 -25,50 -50,25 -50,-25"
            fill={colors["border"]}
            stroke={colors["track"]}
            strokeWidth="2"
          />
          <circle
            fill={colors["border"]}
            stroke={colors["track"]}
            strokeWidth="2"
            cx="-25"
            cy="-25"
            r="25"
          />
          <circle
            fill={colors["border"]}
            stroke={colors["track"]}
            strokeWidth="2"
            cx="25"
            cy="-25"
            r="25"
          />
          <circle
            fill={colors["border"]}
            stroke={colors["track"]}
            strokeWidth="2"
            cx="25"
            cy="25"
            r="25"
          />
          <circle
            fill={colors["border"]}
            stroke={colors["track"]}
            strokeWidth="2"
            cx="-25"
            cy="25"
            r="25"
          />
        </g>
      );
    }
  } else {
    return null;
  }
};

export default City;
