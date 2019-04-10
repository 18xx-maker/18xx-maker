import React from "react";
import Color from "./data/Color";
import Config from "./data/Config";

import * as uuid from "uuid";

import find from "ramda/es/find";
import is from "ramda/es/is";
import propEq from "ramda/es/propEq";

const bleedAdjust = (bleed, percent) => {
  let ratio = 0.833333333;

  if(bleed) {
    if(percent >= 50) {
      return `${((percent-50) * ratio) + 50}%`;
    } else {
      return `${50 - ((50-percent) * ratio)}%`;
    }
  } else {
    return `${percent}%`;
  }
};

const radialBleedAdjust = (bleed, percent) => {
  let ratio = 0.833333333;

  if(bleed) {
    return `${percent * ratio}%`;
  } else {
    return `${percent}%`;
  }
};

const Token = ({
  company,
  icon,
  label,
  token,
  inverse,
  width,
  bleed,
  outline
}) => {
  width = width || 25;

  let gradient = null;
  let shape = null;
  let tokenFill = null;
  let color = is(Object, token) ? token.colors[0] : token;

  let clipId = uuid.v4();
  let clip = (
    <clipPath id={clipId}>
      <circle cx="0" cy="0" r={width + (bleed ? 5 : 0)} />
    </clipPath>
  );

  return (
    <Color>
      {(c,t,s,p) => (
        <Config>
          {(config, game) => {

            if (company) {
              let gameCompany = find(propEq("abbrev", company), game.companies);
              label = gameCompany.abbrev;

              if (config.plainMapDestinations) {
                color = "black";
              } else {
                color = gameCompany.color;
              }
            }

            let textFill = (token && token.labelColor) ? c(token.labelColor) : p("black");
            let textStroke = "none";

            if(inverse) {
              textStroke = s(c(color));
              textFill = c(color);
              tokenFill = c("white");
            } else {
              if(is(Object, token)) {
                let id = uuid.v4();
                switch(token.type) {
                case "square":
                  shape = (
                    <rect rx="2" ry="2" x="-17.5" y="-17.5" width="35" height="35"
                          fill={c(token.colors[0])}/>
                  );
                  textFill = token.labelColor ? p(token.labelColor) : t(c(token.colors[0]));
                  tokenFill = c(token.colors[1]);
                  textStroke = "none";
                  break;
                case "quarters":
                  shape = [
                    <rect key="upperLeft" x="-50" y="-50" width="50" height="50"
                          fill={c(token.colors[1])}
                          clipPath={`url(#${clipId})`}/>,
                    <rect key="lowerRight" x="0" y="0" width="50" height="50"
                          fill={c(token.colors[1])}
                          clipPath={`url(#${clipId})`}/>,
                    <rect key="bar" x="-50" y="-8" width="100" height="18"
                          fill={p("white")}
                          stroke={p("black")}
                          clipPath={`url(#${clipId})`}/>
                  ];
                  break;
                case "halves":
                  gradient = (
                    <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                      <stop offset={bleedAdjust(bleed, 50)} stopColor={c(token.colors[1])}/>
                      <stop offset={bleedAdjust(bleed, 50)} stopColor={c(token.colors[0])}/>
                    </linearGradient>
                  );
                  shape = (
                    <rect x="-50" y="-9" width="100" height="18"
                          fill={p("white")}
                          stroke={p("black")}
                          clipPath={`url(#${clipId})`}/>
                  );
                  break;
                case "stripes":
                  gradient = (
                    <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                      <stop offset={bleedAdjust(bleed,12.5)} stopColor={c(token.colors[0])}/>
                      <stop offset={bleedAdjust(bleed,12.5)} stopColor={c(token.colors[1])}/>
                      <stop offset={bleedAdjust(bleed,25)} stopColor={c(token.colors[1])}/>
                      <stop offset={bleedAdjust(bleed,25)} stopColor={c(token.colors[0])}/>
                      <stop offset={bleedAdjust(bleed,37.5)} stopColor={c(token.colors[0])}/>
                      <stop offset={bleedAdjust(bleed,37.5)} stopColor={c(token.colors[1])}/>
                      <stop offset={bleedAdjust(bleed,62.5)} stopColor={c(token.colors[1])}/>
                      <stop offset={bleedAdjust(bleed,62.5)} stopColor={c(token.colors[0])}/>
                      <stop offset={bleedAdjust(bleed,75)} stopColor={c(token.colors[0])}/>
                      <stop offset={bleedAdjust(bleed,75)} stopColor={c(token.colors[1])}/>
                      <stop offset={bleedAdjust(bleed,87.5)} stopColor={c(token.colors[1])}/>
                      <stop offset={bleedAdjust(bleed,87.5)} stopColor={c(token.colors[0])}/>
                    </linearGradient>
                  );
                  shape = (
                    <rect x="-50" y="-9" width="100" height="18"
                          fill={p("white")}
                          stroke={p("black")}
                          clipPath={`url(#${clipId})`}/>
                  );
                  break;
                case "bar":
                  shape = (
                    <rect x="-50" y="-9" width="100" height="18"
                          fill={c(token.colors[1] || "white")}
                          stroke={p("black")}
                          clipPath={`url(#${clipId})`}/>
                  );
                  textFill = token.labelColor ? c(token.labelColor) : t(c(token.colors[1] || "white"));
                  break;
                case "stripe":
                  gradient = (
                    <linearGradient id={id}>
                      <stop offset={bleedAdjust(bleed,38)} stopColor={c(token.colors[0])}/>
                      <stop offset={bleedAdjust(bleed,38)} stopColor={c(token.colors[1])}/>
                      <stop offset={bleedAdjust(bleed,62)} stopColor={c(token.colors[1])}/>
                      <stop offset={bleedAdjust(bleed,62)} stopColor={c(token.colors[0])}/>
                    </linearGradient>
                  );
                  shape = (
                    <rect x="-50" y="-9" width="100" height="18"
                          fill={p("white")}
                          stroke={p("black")}
                          clipPath={`url(#${clipId})`}/>
                  );
                  break;
                case "target":
                  gradient = (
                    <radialGradient id={id}>
                      <stop offset={radialBleedAdjust(bleed,25)} stopColor={c(token.colors[1])}/>
                      <stop offset={radialBleedAdjust(bleed,25)} stopColor={c(token.colors[0])}/>
                      <stop offset={radialBleedAdjust(bleed,50)} stopColor={c(token.colors[0])}/>
                      <stop offset={radialBleedAdjust(bleed,50)} stopColor={c(token.colors[1])}/>
                      <stop offset={radialBleedAdjust(bleed,75)} stopColor={c(token.colors[1])}/>
                      <stop offset={radialBleedAdjust(bleed,75)} stopColor={c(token.colors[0])}/>
                    </radialGradient>
                  );
                  shape = (
                    <rect x="-50" y="-9" width="100" height="18"
                          fill={p("white")}
                          stroke={p("black")}
                          clipPath={`url(#${clipId})`}/>
                  );
                  break;
                default:
                  break;
                }

                tokenFill = gradient ? `url(#${id})` : (tokenFill || c(color));
              } else {

                textFill = t(c(color));
                tokenFill = c(color) || p("white");
              }
            }

            let content = icon ? (
              <use href={icon} transform="scale(1.66666 1.66666)" />
            ) : (
              <text
                fontFamily="Bitter"
                fontSize={width * 0.64}
                textAnchor="middle"
                strokeWidth="0.5"
                stroke={textStroke}
                fill={textFill}
                textLength={
                  label ?
                    label.length > 2
                    ? width * 2 - width * 0.4
                    : label.length === 1
                    ? width * 0.5
                    : width
                  : 0
                }
                lengthAdjust="spacingAndGlyphs"
                x="0"
                y={width * 0.24}
              >
                {label}
              </text>
            );
            return (
              <g>
                {clip}
                {gradient}
                <circle
                  cx="0"
                  cy="0"
                  r={width + (bleed ? 5 : 0)}
                  fill={tokenFill}
                  stroke={p(outline || "black")}
                />
                {shape}
                {content}
              </g>
            );
          }}
        </Config>
      )}
    </Color>
  );
};

export default Token;
