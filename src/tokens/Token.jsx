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

  type, // What special type of token to render (for special shapes and patterns)
  bar, // Do we add a white bar around the text?
  barHeight, // Height override for white bar

  width, // Set the width directly, overrides the "destination" option
  destination, // Is this a destination token? Sets a smaller default width
  reserved, // Is this a reserved token? Sets it to a gray color
  inverse, // Should we render the "inverse" of this token? No logos, only text

  bleed, // Should we draw bleed around the token (for printing)
  outline, // Should we draw an outline around the token circle
  outlineWidth, // What stroke width to use on the outline

  target, // Colors for target shape
  stripe, // Colors for stripe shape
  stripes, // Colors for stripes shape
  halves, // Colors for halves shape
  quarters, // Colors for quarters shape
  square, // Draw a square of a certain color on the token
  angle // option for some of the token types
}) => {
  // Set a default width (smaller for destination tokens)
  width = width || (destination ? 15 : 25);

  // If this is a reserved token, override the color to gray
  if (reserved) {
    color = "gray";
  }

  // If we passed in a valid logo, set the token type to that
  // if (logos[logo]) {
  //   type = "logo";
  // }

  // Gradient to use as the background of the token
  let gradient = null;

  // Array of svg elements to add to the token
  let shapes = [];

  // Create a clipping object for this token
  let clipId = uuid.v4();
  let clip = (
    <clipPath id={clipId}>
      <circle cx="0" cy="0" r={width + (bleed ? 5 : 0)} />
    </clipPath>
  );

  // Random id for gradients to use
  let id = uuid.v4();

  return (
    <Color>
      {(c,t,s,p) => {
        // Let the text color be specified, or just use the proper color for the
        // token / bar
        let textStroke = "none";
        let textFill = t(c(color) || p("white"));

        // Background fill to use for the main token circle object
        let tokenFill = c(color) || p("white");

        if(inverse && logo && logos[logo]) {
          // Draw inversed logos same as reserved
          color = "gray";
          let svg = logos[logo];
          let start = -1 * width;
          let size = 2 * width;
          let Component = svg.Component;
          shapes.push(
            <Component className={`color-main-${color} color-reserved`}
                       x={start} y={start}
                       height={size} width={size}/>
          );
          tokenFill = c("white");
          textStroke = "none";
          textFill = "none";

        } else if(inverse) {
          // Inverse tokens are always white with colored text
          textStroke = s(c(color));
          textFill = c(color);
          tokenFill = c("white");

        } else if (logo && logos[logo]) {
          let svg = logos[logo];
          let start = -1 * width;
          let size = 2 * width;
          let Component = svg.Component;
          shapes.push(
            <Component key="logo" className={`color-main-${color}${reserved ? " color-reserved" : ""}`}
                       x={start} y={start}
                       height={size} width={size}/>
          );
          tokenFill = c("white");
          textStroke = "none";
          textFill = "none";

        } else {

          if (square) {
            shapes.push(
              <g key="square" transform={`rotate(${angle || 0})`}>
                <rect rx={width * 0.08} ry={width * 0.08}
                      x={width * -0.7} y={width * -0.7}
                      width={width * 1.4} height={width * 1.4}
                      fill={c(square)} />
              </g>
            );
            textFill = t(c(square));
          }

          if (quarters) {
            shapes.push(<g key="quarters" transform={`rotate(${angle || 0})`}>
                          <rect key="upperLeft" x="-50" y="-50" width="50" height="50"
                                fill={c(quarters[0])}
                                clipPath={`url(#${clipId})`}/>,
                          <rect key="upperRight" x="0" y="-50" width="50" height="50"
                                fill={c(quarters[1])}
                                clipPath={`url(#${clipId})`}/>,
                          <rect key="lowerLeft" x="-50" y="0" width="50" height="50"
                                fill={c(quarters[2])}
                                clipPath={`url(#${clipId})`}/>,
                          <rect key="lowerRight" x="0" y="0" width="50" height="50"
                                fill={c(quarters[3])}
                                clipPath={`url(#${clipId})`}/>,
                        </g>);
          }

          if (halves) {
            shapes.push(<g key="halves" transform={`rotate(${angle || 0})`}>
                          <rect key="upper" x="-50" y="-50" width="100" height="50"
                                fill={c(halves[0])}
                                clipPath={`url(#${clipId})`}/>,
                          <rect key="lower" x="-50" y="0" width="100" height="50"
                                fill={c(halves[1])}
                                clipPath={`url(#${clipId})`}/>,
                        </g>);
          }

          if (stripes) {
            gradient = (
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset={bleedAdjust(bleed,12.5)} stopColor={c(color)}/>
                <stop offset={bleedAdjust(bleed,12.5)} stopColor={c(stripes)}/>
                <stop offset={bleedAdjust(bleed,25)} stopColor={c(stripes)}/>
                <stop offset={bleedAdjust(bleed,25)} stopColor={c(color)}/>
                <stop offset={bleedAdjust(bleed,75)} stopColor={c(color)}/>
                <stop offset={bleedAdjust(bleed,75)} stopColor={c(stripes)}/>
                <stop offset={bleedAdjust(bleed,87.5)} stopColor={c(stripes)}/>
                <stop offset={bleedAdjust(bleed,87.5)} stopColor={c(color)}/>
              </linearGradient>
            );
          }

          if (stripe) {
            gradient = (
              <linearGradient id={id}>
                <stop offset={bleedAdjust(bleed,38)} stopColor={c(color)}/>
                <stop offset={bleedAdjust(bleed,38)} stopColor={c(stripe)}/>
                <stop offset={bleedAdjust(bleed,62)} stopColor={c(stripe)}/>
                <stop offset={bleedAdjust(bleed,62)} stopColor={c(color)}/>
              </linearGradient>
            );
          }

          if (target) {
            gradient = (
              <radialGradient id={id}>
                <stop offset={radialBleedAdjust(bleed,25)} stopColor={c(target)}/>
                <stop offset={radialBleedAdjust(bleed,25)} stopColor={c(color)}/>
                <stop offset={radialBleedAdjust(bleed,50)} stopColor={c(color)}/>
                <stop offset={radialBleedAdjust(bleed,50)} stopColor={c(target)}/>
                <stop offset={radialBleedAdjust(bleed,75)} stopColor={c(target)}/>
                <stop offset={radialBleedAdjust(bleed,75)} stopColor={c(color)}/>
              </radialGradient>
            );
          }

          if (bar) {
            let height = barHeight || (width * 0.72);
            let y = height * -0.5;

            shapes.push(
              <rect key="bar" x="-50" y={y} width="100" height={height}
                    fill={bar === true ? p("white") : c(bar)}
                    stroke={p("black")}
                    clipPath={`url(#${clipId})`}/>
            );
            textFill = t(bar === true ? p("white") : c(bar));
          }

          // If we specified a labelColor, use it
          if (labelColor) {
            textFill = c(labelColor);
          }

          // Fill the token with the gradient if we set it
          if (gradient) {
            tokenFill = `url(#${id})`;
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
                           x="0"
                           y={(width * 0.24) + 12}
                         >
                           {label}
                         </text>
                        );
          }
        } else if (label && label.length > 0) {
          let fontSize = width * 0.64;
          let y = width * 0.22;
          if (label.length > 4) {
            fontSize = fontSize * 0.8;
            y = y * 0.8;
          }
          content.push(<text
                         key="text"
                         fontFamily="display"
                         fontSize={fontSize}
                         textAnchor="middle"
                         strokeWidth="0.5"
                         stroke={textStroke}
                         fill={textFill}
                         x="0"
                         y={y}
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
                stroke="none"
              />
            </g>
            {shapes}
            {content}
            <circle
              cx="0"
              cy="0"
              r={width + (bleed ? 5 : 0)}
              fill="none"
              stroke={outlineColor}
              strokeWidth={outlineWidth || 1}
            />
          </g>
        );
      }}
    </Color>
  );
};

export default Token;
