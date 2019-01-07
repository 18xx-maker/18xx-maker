import React from "react";
import { colors, textColor } from "../data";

import Name from "./Name";

const City = ({ size, companies, border, name, extend, rotation }) => {
  if (size === undefined) {
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
          transform={`rotate(${companies[num].rotate ?  0 : -rotation || 0})`}
          fill={companyTextColor(num)}
          fontFamily="Bitter"
          fontWeight="bold"
          textLength={
            companies[num].label.length > 2
              ? 40
              : companies[num].label.length === 1
                ? 12.5
                : 25
          }
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

  let nameNode = null;

  if (name) {
    let path = `city${size > 1 ? size : ""}Path`;
    if(name.reverse) {
      path = path + "Reverse";
    }
    nameNode = <Name {...name}
                     y={name.y || (name.reverse ? 7 : 0)}
                     path={path} />;
  }

  if (size === 1) {
    if (border) {
      return (
        <circle fill={colors["border"]} stroke="none" cx="0" cy="0" r="28" />
      );
    } else {
      return (
        <g>
          <circle
            fill={companyColor(0)}
            stroke={colors["track"]}
            strokeWidth="2"
            cx="0"
            cy="0"
            r="25"
          />
          {companyLabel(0)}
          {nameNode}
        </g>
      );
    }
  } else if (size === 2) {
    let leftBorder = extend === "left" ? -55 : -25;
    let rightBorder = extend === "right" ? 55 : 25;
    if (border) {
      return (
        <polygon
          points={`${leftBorder},0 ${rightBorder},0`}
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
            points={`${leftBorder},-25, ${rightBorder},-25 ${rightBorder},25 ${leftBorder},25`}
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
          {nameNode}
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
          {nameNode}
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
