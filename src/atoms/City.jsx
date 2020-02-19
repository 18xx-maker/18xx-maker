import React from "react";
import { connect } from "react-redux";
import Color from "../data/Color";
import iconSvgs from "../data/icons";

import Name from "./Name";

import is from "ramda/src/is";

import GameMapCompanyToken from "../tokens/GameMapCompanyToken";

import ColorContext from "../context/ColorContext";
import RotateContext from "../context/RotateContext";

const City = ({ straightCityNames, size, companies, icons, border, name, extend, rotation, pass, bgColor }) => {
  if (size === undefined) {
    size = 1;
  }

  let icon = num => {
    if (icons && icons[num]) {
      let iconSvg = iconSvgs[icons[num]];
      let Component = iconSvg.Component;
      return <g transform="scale(1.4)"><Component x={-12.5} y={-12.5} height={25} width={25}/></g>;
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
    let path = straightCityNames ? null : `city${size > 1 ? size : ""}Path`;
    if(path && name.reverse) {
      path = path + "Reverse";
    }
    let y = name.y || (name.reverse ? 7 : 0);
    if (straightCityNames) {
      y -= name.reverse ? -24 : 32;
    }
    nameNode = <Name bgColor={bgColor} {...name} y={y} path={path} />;
  }

  if (size === 1) {
    if (border) {
      return (
        <Color>
          {c => (
            <g>
              {pass && <polygon
                          fill={c("border")}
                          stroke="none"
                          points="0,-46 -39.83716857,23 39.83716857,23"
                          />}
              <circle fill={c("border")} stroke="none" cx="0" cy="0" r="28" />
            </g>
          )}
        </Color>
      );
    } else {
      return (
        <g>
          <Color context="companies">
            {c => (
              <g>
                {pass && <polygon
                          fill={c("gray")}
                          stroke={c("track")}
                          strokeWidth="2"
                          points="0,-40 -34.64101615,20 34.64101615,20"
                        />}
                <circle
                  fill={c(companyColor(0) || "city")}
                  stroke="none"
                  cx="0"
                  cy="0"
                  r="25"
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
                strokeWidth="2"
                cx="0"
                cy="0"
                r="25"
              />
            )}
          </Color>
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
            <g>
              {pass && <polygon
                            fill={c("border")}
                            stroke="none"
                            points="0,-48 -48.49742261,35 48.49742261,35"
                    />}
              <polygon
                points={`${leftBorder},0 ${rightBorder},0`}
                fill={c("border")}
                stroke={c("border")}
                strokeWidth="56"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          )}
        </Color>
      );
    } else {
      return (
        <Color context="companies">
          {c => (
            <g>
              {pass && <polygon
                          fill={c("gray")}
                          stroke={c("track")}
                          strokeWidth="2"
                          points="0,-42 -43.30127019,32 43.30127019,32"
                        />}
              <polygon
                points={`${leftBorder},-25, ${rightBorder},-25 ${rightBorder},25 ${leftBorder},25`}
                fill={c("city")}
                stroke={c("track")}
                strokeWidth="2"
              />
              <g transform="translate(-25 0)">
                <circle
                  fill={c(companyColor(0) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(0)}
                {companyLabel(0)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform="translate(25 0)">
                <circle
                  fill={c(companyColor(1) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(1)}
                {companyLabel(1)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
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
                  fill={c(companyColor(0) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(0)}
                {companyLabel(0)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform="translate(-25 15)">
                <circle
                  fill={c(companyColor(1) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(1)}
                {companyLabel(1)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform="translate(25 15)">
                <circle
                  fill={c(companyColor(2) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(2)}
                {companyLabel(2)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
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
                  fill={c(companyColor(0) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(0)}
                {companyLabel(0)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform="translate(25 -25)">
                <circle
                  fill={c(companyColor(1) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(1)}
                {companyLabel(1)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform="translate(25 25)">
                <circle
                  fill={c(companyColor(3) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(3)}
                {companyLabel(3)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform="translate(-25 25)">
                <circle
                  fill={c(companyColor(2) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(2)}
                {companyLabel(2)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
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
            <circle cx="0" cy="0" r="70.5"
                    fill={c("border")}
                    stroke="none" />
          )}
        </Color>
      );
    } else {
      let radius = 42.5;
      return (
        <Color context="companies">
          {c => (
            <g>
              <circle cx="0" cy="0" r="67.5"
                      fill={c("city")}
                      stroke={c("track")}
                      strokeWidth="2" />
              <g transform={`translate(${-radius * Math.sin(180 * Math.PI / 180)} ${radius * Math.cos(180 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(0) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(0)}
                {companyLabel(0)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(252 * Math.PI / 180)} ${radius * Math.cos(252 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(1) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(1)}
                {companyLabel(1)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(324 * Math.PI / 180)} ${radius * Math.cos(324 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(2) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(2)}
                {companyLabel(2)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(36 * Math.PI / 180)} ${radius * Math.cos(36 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(3) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(3)}
                {companyLabel(3)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(108 * Math.PI / 180)} ${radius * Math.cos(108 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(4) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(4)}
                {companyLabel(4)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
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
            <circle cx="0" cy="0" r="78"
                    fill={c("border")}
                    stroke="none" />
          )}
        </Color>
      );
    } else {
      let radius = 50;
      return (
        <Color context="companies">
          {c => (
            <g>
              <circle cx="0" cy="0" r="75"
                      fill={c("city")}
                      stroke={c("track")}
                      strokeWidth="2" />
              <g transform={`translate(${-radius * Math.sin(180 * Math.PI / 180)} ${radius * Math.cos(180 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(0) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(0)}
                {companyLabel(0)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(240 * Math.PI / 180)} ${radius * Math.cos(240 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(1) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(1)}
                {companyLabel(1)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(300 * Math.PI / 180)} ${radius * Math.cos(300 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(2) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(2)}
                {companyLabel(2)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(0 * Math.PI / 180)} ${radius * Math.cos(0 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(3) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(3)}
                {companyLabel(3)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(60 * Math.PI / 180)} ${radius * Math.cos(60 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(4) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(4)}
                {companyLabel(4)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
                />
              </g>
              <g transform={`translate(${-radius * Math.sin(120 * Math.PI / 180)} ${radius * Math.cos(120 * Math.PI / 180)})`}>
                <circle
                  fill={c(companyColor(5) || "city")}
                  stroke="none"
                  r="25"
                />
                {icon(5)}
                {companyLabel(5)}
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth="2"
                  r="25"
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

const mapStateToProps = state => ({
  straightCityNames: state.config.straightCityNames
});

export default connect(mapStateToProps)(City);
