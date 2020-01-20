import React from "react";
import Color from "../data/Color";

import * as uuid from "uuid";

import logos from "../data/logos";

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
  logo, // The SVG logo to display on this token
  icon, // The path-based icon (defined in App.jsx) to display on this token
  label, // The text label to use on this token
  labelColor, // What color to use for writing the label text
  color, // What color is this token using as a background
  colors, // What colors is this token using (array of colors). Overrides the
  // "color" option

  type, // What special type of token to render (for special shapes and patterns)

  width, // Set the width directly, overrides the "destination" option
  destination, // Is this a destination token? Sets a smaller default width
  reserved, // Is this a reserved token? Sets it to a gray color
  inverse, // Should we render the "inverse" of this token? No logos, only text

  bleed, // Should we draw bleed around the token (for printing)
  outline, // Should we draw an outline around the token circle
  outlineWidth, // What stroke width to use on the outline

  angle // option for some of the token types
}) => {
  // If we only passed in one color, collect it in a single item array as "colors"
  colors = colors || [color];

  // Set a default width (smaller for destination tokens)
  width = width || (destination ? 15 : 25);

  // If thi is a reserved token, override the color to gray
  if (reserved) {
    colors = ["gray"];
  }

  // If we passed in a valid logo, set the token type to that
  if (logos[logo]) {
    type = "logo";
  }

  let gradient = null;
  let shape = null;
  let tokenFill = null;

  let clipId = uuid.v4();
  let clip = (
    <clipPath id={clipId}>
      <circle cx="0" cy="0" r={width + (bleed ? 5 : 0)} />
    </clipPath>
  );

  return (
    <Color>
      {(c,t,s,p) => {
        let textFill = labelColor ? c(labelColor) : t(c(colors[0]));
        let textStroke = "none";

        if(inverse) {
          // Inverse tokens are always white with colored text
          textStroke = s(c(color));
          textFill = c(color);
          tokenFill = c("white");
        } else {

          // If we passed in a type, setup special rendering
          if(type) {
            let id = uuid.v4();
            switch(type) {
            case "square":
              shape = (
                <g transform={`rotate(${angle || 0})`}>
                  <rect rx="2" ry="2" x="-17.5" y="-17.5" width="35" height="35"
                        fill={c(colors[0])}/>
                </g>
              );
              textFill = labelColor ? p(labelColor) : t(c(colors[0]));
              tokenFill = c(colors[1]);
              textStroke = "none";
              break;
            case "quarters":
              shape = [<g key="quads" transform={`rotate(${angle || 0})`}>
                         <rect key="upperLeft" x="-50" y="-50" width="50" height="50"
                               fill={c(colors[1])}
                               clipPath={`url(#${clipId})`}/>,
                         <rect key="lowerRight" x="0" y="0" width="50" height="50"
                               fill={c(colors[1])}
                               clipPath={`url(#${clipId})`}/>,
                       </g>,
                       <rect key="bar" x="-50" y="-8" width="100" height="18"
                             fill={p("white")}
                             stroke={p("black")}
                             clipPath={`url(#${clipId})`}/>];
              textFill = t(c("white"));
              break;
            case "halves":
              gradient = (
                <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                  <stop offset={bleedAdjust(bleed, 50)} stopColor={c(colors[1])}/>
                  <stop offset={bleedAdjust(bleed, 50)} stopColor={c(colors[0])}/>
                </linearGradient>
              );
              shape = (
                <rect x="-50" y="-9" width="100" height="18"
                      fill={p("white")}
                      stroke={p("black")}
                      clipPath={`url(#${clipId})`}/>
              );
              textFill = t(c("white"));
              break;
            case "stripes":
              gradient = (
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset={bleedAdjust(bleed,12.5)} stopColor={c(colors[0])}/>
                  <stop offset={bleedAdjust(bleed,12.5)} stopColor={c(colors[1])}/>
                  <stop offset={bleedAdjust(bleed,25)} stopColor={c(colors[1])}/>
                  <stop offset={bleedAdjust(bleed,25)} stopColor={c(colors[0])}/>
                  <stop offset={bleedAdjust(bleed,37.5)} stopColor={c(colors[0])}/>
                  <stop offset={bleedAdjust(bleed,37.5)} stopColor={c(colors[1])}/>
                  <stop offset={bleedAdjust(bleed,62.5)} stopColor={c(colors[1])}/>
                  <stop offset={bleedAdjust(bleed,62.5)} stopColor={c(colors[0])}/>
                  <stop offset={bleedAdjust(bleed,75)} stopColor={c(colors[0])}/>
                  <stop offset={bleedAdjust(bleed,75)} stopColor={c(colors[1])}/>
                  <stop offset={bleedAdjust(bleed,87.5)} stopColor={c(colors[1])}/>
                  <stop offset={bleedAdjust(bleed,87.5)} stopColor={c(colors[0])}/>
                </linearGradient>
              );
              shape = (
                <rect x="-50" y="-9" width="100" height="18"
                      fill={p("white")}
                      stroke={p("black")}
                      clipPath={`url(#${clipId})`}/>
              );
              textFill = t(c("white"));
              break;
            case "bar":
              shape = (
                <rect x="-50" y="-9" width="100" height="18"
                      fill={c(colors[1] || "white")}
                      stroke={p("black")}
                      clipPath={`url(#${clipId})`}/>
              );
              textFill = labelColor ? c(labelColor) : t(c(colors[1] || "white"));
              break;
            case "stripe":
              gradient = (
                <linearGradient id={id}>
                  <stop offset={bleedAdjust(bleed,38)} stopColor={c(colors[0])}/>
                  <stop offset={bleedAdjust(bleed,38)} stopColor={c(colors[1])}/>
                  <stop offset={bleedAdjust(bleed,62)} stopColor={c(colors[1])}/>
                  <stop offset={bleedAdjust(bleed,62)} stopColor={c(colors[0])}/>
                </linearGradient>
              );
              shape = (
                <rect x="-50" y="-9" width="100" height="18"
                      fill={p("white")}
                      stroke={p("black")}
                      clipPath={`url(#${clipId})`}/>
              );
              textFill = t(c("white"));
              break;
            case "target":
              gradient = (
                <radialGradient id={id}>
                  <stop offset={radialBleedAdjust(bleed,25)} stopColor={c(colors[1])}/>
                  <stop offset={radialBleedAdjust(bleed,25)} stopColor={c(colors[0])}/>
                  <stop offset={radialBleedAdjust(bleed,50)} stopColor={c(colors[0])}/>
                  <stop offset={radialBleedAdjust(bleed,50)} stopColor={c(colors[1])}/>
                  <stop offset={radialBleedAdjust(bleed,75)} stopColor={c(colors[1])}/>
                  <stop offset={radialBleedAdjust(bleed,75)} stopColor={c(colors[0])}/>
                </radialGradient>
              );
              shape = (
                <rect x="-50" y="-9" width="100" height="18"
                      fill={p("white")}
                      stroke={p("black")}
                      clipPath={`url(#${clipId})`}/>
              );
              textFill = t(c("white"));
              break;
            case "logo":
              let svg = logos[logo];
              let start = -1 * width;
              let size = 2 * width;
              let Component = svg.Component;
              shape = (
                <Component className={`color-main-${colors[0]}${reserved ? " color-reserved" : ""}`}
                           x={start} y={start}
                           height={size} width={size}/>
              );
              tokenFill = c("white");
              textStroke = "none";
              textFill = "none";
              break;
            default:
              break;
            }

            tokenFill = gradient ? `url(#${id})` : (tokenFill || c(colors[0]));
          } else {

            textFill = t(c(colors[0]) || p("white"));
            tokenFill = c(colors[0]) || p("white");
          }
        }

        let content = [];
        if (icon) {
          content.push(<use key="icon" href={`#${icon}`} transform="scale(1.66666 1.66666)" />);
          if (label) {
            content.push(<text
                           key="text"
                           fontFamily="display"
                           fontSize={width * 0.48}
                           textAnchor="middle"
                           strokeWidth="0.5"
                           stroke={textStroke}
                           fill={textFill}
                           textLength={
                             label ?
                               label.length > 2
                               ? width * 1.8 - width * 0.4
                               : label.length === 1
                               ? width * 0.4
                               : width * 0.8
                             : 0
                           }
                           lengthAdjust="spacingAndGlyphs"
                           x="0"
                           y={(width * 0.24) + 12}
                         >
                           {label}
                         </text>
                        );
          }
        } else {
          content.push(<text
                         key="text"
                         fontFamily="display"
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
        }

        let outlineColor = p(outline || "black");
        return (
          <g>
            {clip}
            {gradient}
            <g transform={`rotate(${angle || 0})`}>
              <circle
                cx="0"
                cy="0"
                r={width + (bleed ? 5 : 0)}
                fill={tokenFill}
                stroke={outlineColor}
                strokeWidth={outlineWidth || 1}
              />
            </g>
            {shape}
            {content}
          </g>
        );
      }}
    </Color>
  );
};

export default Token;
