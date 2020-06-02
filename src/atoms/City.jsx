import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";
import Color from "../data/Color";
import iconSvgs from "../data/icons";

import Name from "./Name";

import is from "ramda/src/is";

import GameMapCompanyToken from "../tokens/GameMapCompanyToken";

import ColorContext from "../context/ColorContext";
import RotateContext from "../context/RotateContext";

const cityPaths = {
  cityPath: "M 0 30 A 30 30 0 0 1 0 -30 A 30 30 0 0 1 0 30",
  cityPathReverse: "M 0 -30 A 30 30 0 0 0 0 30 A 30 30 0 0 0 0 -30",
  city2Path: "M 0 30 L -25 30 A 30 30 0 0 1 -25 -30 L 25 -30 A 30 30 0 0 1 25 30 L 0 30",
  city2PathReverse: "M 0 -30 L -25 -30 A 30 30 0 0 0 -25 30 L 25 30 A 30 30 0 0 0 25 -30 L 0 -30",
  city3Path: "M 0 44 L -28 44 A 30 30 0 0 1 -50 -1 L -25 -44 A 30 30 0 0 1 25 -44 L 50 -1 A 30 30 0 0 1 28 44 L 0 44",
  city3PathReverse: "M 0 44 L 28 44 A 30 30 0 0 0 50 -1 L 25 -44 A 30 30 0 0 0 -25 -44 L -50 -1 A 30 30 0 0 0 -28 44 L 0 44",
  city4Path: "M 0 53 L -25 53 A 30 30 0 0 1 -53 25 L -53 -25 A 30 30 0 0 1 -25 -53 L 25 -53 A 30 30 0 0 1 53 -25 L 53 25 A 30 30 0 0 1 25 53 L 0 53",
  city4PathReverse: "M 0 53 L 25 53 A 30 30 0 0 0 53 25 L 53 -25 A 30 30 0 0 0 25 -53 L -25 -53 A 30 30 0 0 0 -53 -25 L -53 25 A 30 30 0 0 0 -25 53 L 0 53"
}

const City = ({ size, companies, icons, border, name, extend, rotation, pass, bgColor, width, strokeWidth }) => {
  const { config } = useContext(ConfigContext);
  const straightCityNames = config.straightCityNames;

  if (size === undefined) {
    size = 1;
  }
  width = width || 25;
  strokeWidth = strokeWidth || 2;
  let borderW = 3;
  let sqrt5 = Math.sqrt(5);
  let scale = width / 25;

  let icon = num => {
    if (icons && icons[num]) {
      let iconSvg = iconSvgs[icons[num]];
      let Component = iconSvg.Component;
      return <g transform="scale(1.4)"><Component x={-12.5} y={-12.5} height={width} width={width}/></g>;
    }

    return null;
  }

  let companyColor = num =>
      (companies &&
       companies[num] &&
       companies[num].color);

  let companyLabel = num => {
    // Do we have companies defined for this city space?
    if(companies && companies[num]) {

      let companyToken = is(Object, companies[num]) ?
          <GameMapCompanyToken {...companies[num]} abbrev={companies[num].abbrev || companies[num].label} /> :
          <GameMapCompanyToken abbrev={companies[num]} />;

      return (
        <RotateContext.Consumer>
        {rotateContext => (
          <g transform={`rotate(${-(rotateContext || 0) - (rotation || 0)})`}>
            <ColorContext.Provider value="companies">
              {companyToken}
            </ColorContext.Provider>
          </g>
        )}
        </RotateContext.Consumer>
      );
    }

    return null;
  };

  let nameNode = null;

  if (name) {
    let path = null;
    let y = name.y || (name.reverse ? 7 : 0);
    if (straightCityNames || name.straight) {
      path = null;
      y -= name.reverse ? -24 : 32;
    } else {
      let pathName = `city${size > 1 ? size : ""}Path`;
      if (name.reverse) {
        pathName = pathName + "Reverse";
      }
      path = cityPaths[pathName];
    }
    nameNode = <Name bgColor={bgColor} {...name} y={y} path={path} doRotation={true} />;
  }

  if (size === 1) {
    // points="0,-46 -39.83716857,23 39.83716857,23"
    let pass_p1x = 0 * scale;
    let pass_p1y = -46 * scale;
    let pass_p2x = -39.83716857 * scale;
    let pass_p2y = 23 * scale;
    let pass_p3x = 39.83716857 * scale;
    let pass_p3y = 23 * scale;
    if (border) {
      return (
        <Color>
          {c => (
            <g>
              {pass && <polygon
                          fill={c("border")}
                          stroke="none"
                          points={`${pass_p1x},${pass_p1y} ${pass_p2x},${pass_p2y} ${pass_p3x},${pass_p3y}`}
                          />}
              <circle fill={c("border")} stroke="none" cx="0" cy="0" r={`${width + borderW}`} />
            </g>
          )}
        </Color>
      );
    } else {
      // points="0,-40 -34.64101615,20 34.64101615,20"
      let pass_p1x = 0 * scale;
      let pass_p1y = -40 * scale;
      let pass_p2x = -34.64101615 * scale;
      let pass_p2y = 20 * scale;
      let pass_p3x = 34.64101615 * scale;
      let pass_p3y = 20 * scale;
      return (
        <g>
          <Color context="companies">
            {c => (
              <g>
                {pass && <polygon
                          fill={c("gray")}
                          stroke={c("track")}
                          strokeWidth={strokeWidth}
                          points={`${pass_p1x},${pass_p1y} ${pass_p2x},${pass_p2y} ${pass_p3x},${pass_p3y}`}
                        />}
                <circle
                  fill={c(companyColor(0) || "city")}
                  stroke="none"
                  cx="0"
                  cy="0"
                  r={width}
                />
              </g>
            )}
          </Color>
          {icon(0)}
          {companyLabel(0)}
          <Color context="companies">
            {c => (
              <circle
                fill="none"
                stroke={c("track")}
                strokeWidth={strokeWidth}
                cx="0"
                cy="0"
                r={width}
              />
            )}
          </Color>
          {nameNode}
        </g>
      );
    }
  } else if (size === 2) {
    let leftBorder = extend === "left" ? -55 : -1 * width;
    let rightBorder = extend === "right" ? 55 : width;
    if (border) {
      // points="0,-48 -48.49742261,35 48.49742261,35"
      let pass_p1x = 0 * scale;
      let pass_p1y = -48 * scale;
      let pass_p2x = -48.49742261 * scale;
      let pass_p2y = 35 * scale;
      let pass_p3x = 48.49742261 * scale;
      let pass_p3y = 35 * scale;
      return (
        <Color>
          {c => (
            <g>
              {pass && <polygon
                            fill={c("border")}
                            stroke="none"
                            points={`${pass_p1x},${pass_p1y} ${pass_p2x},${pass_p2y} ${pass_p3x},${pass_p3y}`}
                    />}
              <polygon
                points={`${leftBorder},0 ${rightBorder},0`}
                fill={c("border")}
                stroke={c("border")}
                strokeWidth={`${2 * width + 2 * borderW}`}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          )}
        </Color>
      );
    } else {
      // points="0,-42 -43.30127019,32 43.30127019,32"
      let pass_p1x = 0 * scale;
      let pass_p1y = -42 * scale;
      let pass_p2x = -43.30127019 * scale;
      let pass_p2y = 32 * scale;
      let pass_p3x = 43.30127019 * scale;
      let pass_p3y = 32 * scale;
      return (
        <Color context="companies">
          {c => (
            <g>
              {pass && <polygon
                          fill={c("gray")}
                          stroke={c("track")}
                          strokeWidth={strokeWidth}
                          points={`${pass_p1x},${pass_p1y} ${pass_p2x},${pass_p2y} ${pass_p3x},${pass_p3y}`}
                        />}
              <polygon
                points={`${leftBorder},${-1*width}, ${rightBorder},${-1*width} ${rightBorder},${width} ${leftBorder},${width}`}
                fill={c("city")}
                stroke={c("track")}
                strokeWidth={strokeWidth}
              />
              <g transform={`translate(${-1*width} 0)`}>
                <circle
                  fill={c(companyColor(0) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(0)}
                {companyLabel(0)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${width} 0)`}>
                <circle
                  fill={c(companyColor(1) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(1)}
                {companyLabel(1)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              {nameNode}
            </g>
          )}
        </Color>
      );
    }
  } else if (size === 3) {
    let offs1 = width / sqrt5;
    let offs2 = 2 * width / sqrt5;
    let offs2m = width * sqrt5 / 2;
    //points="0,-29 25,15 -25,15"
    if (border) {
      return (
        <Color>
          {c => (
            <polygon
              transform="rotate(-30)"
              points={`0,${-1 * offs2m - 2} ${width},${offs1 + 2} ${-1 * width},${offs1 + 2}`}
              fill={c("border")}
              stroke={c("border")}
              strokeWidth={`${2 * width + 2 * borderW}`}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
        </Color>
      );
    } else {
      //points="-21,-42, 21,-42 45,-1 25,40 -25,40 -45,-1"
      return (
        <Color context="companies">
          {c => (
            <g transform="rotate(-30)">
              <polygon
                points=
                {`${-1 * offs2},${-1 * (offs2m + offs1 + strokeWidth)}
                  ${offs2},${-1* (offs2m + offs1 + strokeWidth)}
                  ${width + offs2},${strokeWidth - 1}
                  ${width},${width + offs1 + strokeWidth}
                  ${-1 * width},${width + offs1 + strokeWidth}
                  ${-1 * (width + offs2)},${strokeWidth - 1}`}
                fill={c("city")}
                stroke={c("track")}
                strokeWidth={strokeWidth}
              />
              <g transform={`translate(0 ${-1*(offs2m + strokeWidth)}) rotate(30)`}>
                <circle
                  fill={c(companyColor(0) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(0)}
                {companyLabel(0)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${-1 * width} ${offs1 + strokeWidth}) rotate(30)`}>
                <circle
                  fill={c(companyColor(1) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(1)}
                {companyLabel(1)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${width} ${offs1 + strokeWidth}) rotate(30)`}>
                <circle
                  fill={c(companyColor(2) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(2)}
                {companyLabel(2)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              {nameNode}
            </g>
          )}
        </Color>
      );
    }
  } else if (size === 4) {
    if (border) {
      // points="-25,-25 25,-25 25,25 -25,25"
      return (
        <Color>
          {c => (
            <polygon
              points={`${-1 * width},${-1 * width}
                ${width},${-1 * width}
                ${width},${width}
                ${-1 * width},${width}`}
              fill={c("border")}
              stroke={c("border")}
              strokeWidth={`${width * 2 + 6}`}
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
                points={`${-1 * width},${-2 * width}
                   ${width},${-2 * width}
                   ${2 * width},${-1*width}
                   ${2 * width},${width}
                   ${width},${2 * width}
                   ${-1 * width},${2*width}
                   ${-2 * width},${width}
                   ${-2 * width},${-1*width}`}
                fill={c("city")}
                stroke={c("track")}
                strokeWidth={strokeWidth}
              />
              <g transform={`translate(${-1 * width} ${-1 * width})`}>
                <circle
                  fill={c(companyColor(0) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(0)}
                {companyLabel(0)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${width} ${-1 * width})`}>
                <circle
                  fill={c(companyColor(1) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(1)}
                {companyLabel(1)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${width} ${width})`}>
                <circle
                  fill={c(companyColor(3) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(3)}
                {companyLabel(3)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${-1 * width} ${width})`}>
                <circle
                  fill={c(companyColor(2) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(2)}
                {companyLabel(2)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              {nameNode}
            </g>
          )}
        </Color>
      );
    }
  } else if (size === 5) {
    if (border) {
      return (
        <Color>
          {c => (
            <circle cx="0" cy="0" r={`${2 * width + 11.5}`}
                    fill={c("border")}
                    stroke="none" />
          )}
        </Color>
      );
    } else {
      // let radius = 42.5;
      let radius = width * 2 - 7.5
      return (
        <Color context="companies">
          {c => (
            <g>
              <circle cx="0" cy="0" r={`${width * 2 + 8.5} `}
                      fill={c("city")}
                      stroke={c("track")}
                      strokeWidth={strokeWidth} />
              <g transform={`translate(${-radius * Math.sin(180 * Math.PI / 180)} ${radius * Math.cos(180 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(0) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(0)}
                {companyLabel(0)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(252 * Math.PI / 180)} ${radius * Math.cos(252 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(1) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(1)}
                {companyLabel(1)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(324 * Math.PI / 180)} ${radius * Math.cos(324 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(2) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(2)}
                {companyLabel(2)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(36 * Math.PI / 180)} ${radius * Math.cos(36 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(3) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(3)}
                {companyLabel(3)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(108 * Math.PI / 180)} ${radius * Math.cos(108 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(4) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(4)}
                {companyLabel(4)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
            </g>
          )}
        </Color>
      );
    }
  } else if (size === 6) {
    if (border) {
      return (
        <Color>
          {c => (
            <circle cx="0" cy="0" r={`${width * 2 + 17}`}
                    fill={c("border")}
                    stroke="none" />
          )}
        </Color>
      );
    } else {
      let radius = width * 2;
      return (
        <Color context="companies">
          {c => (
            <g>
              <circle cx="0" cy="0" r={`${width * 2 + 14}`}
                      fill={c("city")}
                      stroke={c("track")}
                      strokeWidth={strokeWidth} />
              <g transform={`translate(${-radius * Math.sin(180 * Math.PI / 180)} ${radius * Math.cos(180 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(0) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(0)}
                {companyLabel(0)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(240 * Math.PI / 180)} ${radius * Math.cos(240 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(1) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(1)}
                {companyLabel(1)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(300 * Math.PI / 180)} ${radius * Math.cos(300 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(2) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(2)}
                {companyLabel(2)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(0 * Math.PI / 180)} ${radius * Math.cos(0 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(3) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(3)}
                {companyLabel(3)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(60 * Math.PI / 180)} ${radius * Math.cos(60 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(4) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(4)}
                {companyLabel(4)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(120 * Math.PI / 180)} ${radius * Math.cos(120 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(5) || "city")}
                  stroke="none"
                  r={width}
                />
                {icon(5)}
                {companyLabel(5)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  r={width}
                />
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
