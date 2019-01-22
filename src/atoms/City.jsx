import React from "react";
import Color from "../data/Color";

import Name from "./Name";

const City = ({ size, companies, border, name, extend, rotation }) => {
  if (size === undefined) {
    size = 1;
  }

  let companyColor = num =>
      (companies &&
       companies[num] &&
       companies[num].color);

  let companyLabel = num =>
      (companies &&
       companies[num] &&
       companies[num].label && (
         <Color>
           {(c,t) => (
             <text
               transform={`rotate(${companies[num].rotate ?  0 : -rotation || 0})`}
               fill={t(c(companyColor(num)))}
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
           )}
         </Color>
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
        <Color>
          {c => (
            <circle fill={c("border")} stroke="none" cx="0" cy="0" r="28" />
          )}
        </Color>
      );
    } else {
      return (
        <g>
          <Color context="companies">
            {c => (
              <circle
                fill={c(companyColor(0)) || c("city")}
                stroke={c("track")}
                strokeWidth="2"
                cx="0"
                cy="0"
                r="25"
              />
            )}
          </Color>
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
        <Color>
          {c => (
            <polygon
              points={`${leftBorder},0 ${rightBorder},0`}
              fill={c("border")}
              stroke={c("border")}
              strokeWidth="56"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
        </Color>
      );
    } else {
      return (
        <Color context="companies">
          {c => (
            <g>
              <polygon
                points={`${leftBorder},-25, ${rightBorder},-25 ${rightBorder},25 ${leftBorder},25`}
                fill={c("city")}
                stroke={c("track")}
                strokeWidth="2"
              />
              <g transform="translate(-25 0)">
                <circle
                  fill={c(companyColor(0)) || c("city")}
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
                {companyLabel(0)}
              </g>
              <g transform="translate(25 0)">
                <circle
                  fill={c(companyColor(1)) || c("city")}
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
                {companyLabel(1)}
              </g>
              {nameNode}
            </g>
          )}
        </Color>
      );
    }
  } else if (size === 3) {
    if (border) {
      return (
        <Color>
          {c => (
            <polygon
              points="0,-29 25,15 -25,15"
              fill={c("border")}
              stroke={c("border")}
              strokeWidth="56"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
        </Color>
      );
    } else {
      return (
        <Color context="companies">
          {c => (
            <g>
              <polygon
                points="-21,-42, 21,-42 45,-1 25,40 -25,40 -45,-1"
                fill={c("city")}
                stroke={c("track")}
                strokeWidth="2"
              />
              <g transform="translate(0 -29)">
                <circle
                  fill={c(companyColor(0)) || c("city")}
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
                {companyLabel(0)}
              </g>
              <g transform="translate(-25 15)">
                <circle
                  fill={c(companyColor(1)) || c("city")}
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
                {companyLabel(1)}
              </g>
              <g transform="translate(25 15)">
                <circle
                  fill={c(companyColor(2)) || c("city")}
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
                {companyLabel(2)}
              </g>
              {nameNode}
            </g>
          )}
        </Color>
      );
    }
  } else if (size === 4) {
    if (border) {
      return (
        <Color>
          {c => (
            <polygon
              points="-25,-25 25,-25 25,25 -25,25"
              fill={c("border")}
              stroke={c("border")}
              strokeWidth="56"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
        </Color>
      );
    } else {
      return (
        <Color context="companies">
          {c => (
            <g>
              <polygon
                points="-25,-50, 25,-50 50,-25 50,25 25,50 -25,50 -50,25 -50,-25"
                fill={c("city")}
                stroke={c("track")}
                strokeWidth="2"
              />
              <g transform="translate(-25 -25)">
                <circle
                  fill={c(companyColor(0)) || c("city")}
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
                {companyLabel(0)}
              </g>
              <g transform="translate(25 -25)">
                <circle
                  fill={c(companyColor(1)) || c("city")}
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
                {companyLabel(1)}
              </g>
              <g transform="translate(25 25)">
                <circle
                  fill={c(companyColor(3)) || c("city")}
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
                {companyLabel(3)}
              </g>
              <g transform="translate(-25 25)">
                <circle
                  fill={c(companyColor(2)) || c("city")}
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
                {companyLabel(2)}
              </g>
            </g>
          )}
        </Color>
      );
    }
  } else {
    return null;
  }
};

export default City;
