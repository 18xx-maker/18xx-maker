import React from "react";
import { colors, textColor } from "../data";

import Name from "./Name";

const City = ({ size, companies, border, name }) => {
  if(size === undefined) {
    size = 1;
  }

  let companyColor = num =>
    (companies &&
      companies[num] &&
      companies[num].color &&
      colors[companies[num].color]) ||
    colors["white"];

  let companyTextColor = num =>
    (companies &&
      companies[num] &&
      companies[num].color &&
      textColor(companies[num].color)) ||
    colors["white"];

  let companyLabel = num =>
    (companies &&
      companies[num] &&
      companies[num].label && (
        <text
          fill={companyTextColor(num)}
          fontFamily="Bitter"
          fontWeight="bold"
          textLength={40}
          lengthAdjust="spacingAndGlyphs"
          textAnchor="middle"
          alignmentBaseline="central"
          x="0"
          y="0"
        >
          {companies[num].label}
        </text>
      )) ||
    null;

  if (size === 1) {
    if (border) {
      return (
        <circle fill={colors["border"]} stroke="none" cx="0" cy="0" r="28" />
      );
    } else {
      let nameNode = null;

      if (name) {
        nameNode = (
          <Name
            name={name.name}
            reverse={name.reverse}
            rotation={name.rotation}
          />
        );
      }

      return (
        <g>
          <circle
            fill={companyColor(0)}
            stroke={colors["track"]}
            strokeWidth="2"
            cx="0"
            cy="0"
            r="25"
            clip-path="url(#hexClip)"
          />
          {companyLabel(0)}
          {nameNode}
        </g>
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
          <g transform="translate(-25 0)">
            <circle
              fill={companyColor(0)}
              stroke={colors["track"]}
              strokeWidth="2"
              r="25"
            />
            {companyLabel(0)}
          </g>
          <g transform="translate(25 0)">
            <circle
              fill={companyColor(1)}
              stroke={colors["track"]}
              strokeWidth="2"
              r="25"
            />
            {companyLabel(1)}
          </g>
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
          <g transform="translate(0 -29)">
            <circle
              fill={companyColor(0)}
              stroke={colors["track"]}
              strokeWidth="2"
              r="25"
            />
            {companyLabel(0)}
          </g>
          <g transform="translate(-25 15)">
            <circle
              fill={companyColor(1)}
              stroke={colors["track"]}
              strokeWidth="2"
              r="25"
            />
            {companyLabel(1)}
          </g>
          <g transform="translate(25 15)">
            <circle
              fill={companyColor(2)}
              stroke={colors["track"]}
              strokeWidth="2"
              r="25"
            />
            {companyLabel(2)}
          </g>
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
          <g transform="translate(-25 -25)">
            <circle
              fill={companyColor(0)}
              stroke={colors["track"]}
              strokeWidth="2"
              r="25"
            />
            {companyLabel(0)}
          </g>
          <g transform="translate(25 -25)">
            <circle
              fill={companyColor(1)}
              stroke={colors["track"]}
              strokeWidth="2"
              r="25"
            />
            {companyLabel(1)}
          </g>
          <g transform="translate(25 25)">
            <circle
              fill={companyColor(3)}
              stroke={colors["track"]}
              strokeWidth="2"
              r="25"
            />
            {companyLabel(3)}
          </g>
          <g transform="translate(-25 25)">
            <circle
              fill={companyColor(2)}
              stroke={colors["track"]}
              strokeWidth="2"
              r="25"
            />
            {companyLabel(2)}
          </g>
        </g>
      );
    }
  } else {
    return null;
  }
};

export default City;
