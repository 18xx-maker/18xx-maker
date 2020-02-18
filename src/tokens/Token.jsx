import React from "react";
import Color from "../data/Color";

import * as uuid from "uuid";

import logos from "../data/logos";
import icons from "../data/icons";

import is from "ramda/src/is";

const Token = ({
  logo, // The SVG logo to display on this token
  icon, // The path-based icon (defined in App.jsx) to display on this token
  iconColor, // The color to use for the svg icon
  label, // The text label to use on this token
  labelColor, // What color to use for writing the label text
  color, // What color is this token using as a background

  type, // What special type of token to render (for special shapes and patterns)
  bar, // Do we add a white bar around the text?
  barHeight, // Height override for white bar
  barBorderColor, // Color of borders

  width, // Set the width directly, overrides the "destination" option
  destination, // Is this a destination token? Sets a smaller default width
  reserved, // Is this a reserved token? Sets it to a gray color
  inverse, // Should we render the "inverse" of this token? No logos, only text

  bleed, // Should we draw bleed around the token (for printing)
  outline, // What color to use as the outline
  outlineWidth, // What stroke width to use on the outline

  target, // Colors for target shape
  stripe, // Colors for stripe shape
  stripeWidth, // Width of the stripe

  stripes, // Colors for stripes shape
  stripesWidth, // Width of the stripes
  stripesDistance, // Distance from the middle for stripes

  curvedStripes, // Colors for curved stripes shape
  curvedStripesWidth, // Width of the curved stripes
  curvedStripesDistance, // Distance from the middle for curved stripes

  spiral, // Color of a spiral
  spiralWidth, // Width of the spiral
  spiralDistance, // How far each spiral is

  circle, // Color of a middle circle
  circleRadius, // Radius of the middle circle - 25 is full token radius
  circleBorderColor, // Color of the border on the circle

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

  // Array of svg elements to add to the token
  let shapes = [];

  // Create a clipping object for this token
  let clipId = uuid.v4();
  let clip = (
    <clipPath id={clipId}>
      <circle cx="0" cy="0" r={width + (bleed ? 5 : 0)} />
    </clipPath>
  );

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
                      x={width * -0.75} y={width * -0.75}
                      width={width * 1.5} height={width * 1.5}
                      fill={c(square)} />
              </g>
            );
            textFill = t(c(square));
          }

          if (quarters) {
            shapes.push(<g key="quarters" transform={`rotate(${angle || 0})`}>
                          <rect key="upperLeft" x="-50" y="-50" width="50" height="50"
                                fill={c(quarters[0])}
                                clipPath={`url(#${clipId})`}/>
                          <rect key="upperRight" x="0" y="-50" width="50" height="50"
                                fill={c(quarters[1])}
                                clipPath={`url(#${clipId})`}/>
                          <rect key="lowerLeft" x="-50" y="0" width="50" height="50"
                                fill={c(quarters[2])}
                                clipPath={`url(#${clipId})`}/>
                          <rect key="lowerRight" x="0" y="0" width="50" height="50"
                                fill={c(quarters[3])}
                                clipPath={`url(#${clipId})`}/>
                        </g>);
          }

          if (halves) {
            shapes.push(<g key="halves" transform={`rotate(${angle || 0})`}>
                          <rect key="upper" x="-50" y="-50" width="100" height="50"
                                fill={c(halves[0])}
                                clipPath={`url(#${clipId})`}/>
                          <rect key="lower" x="-50" y="0" width="100" height="50"
                                fill={c(halves[1])}
                                clipPath={`url(#${clipId})`}/>
                        </g>);
          }

          if (spiral) {
            spiralWidth = (width / 25 * spiralWidth) || (width / 8);
            spiralDistance = (width / 25 * spiralDistance) || (width * 0.33);

            let quarterTurns = 25;
            let pointsPerQuarter = 90;
            let startRadius = spiralDistance / 4;
            let endRadius = spiralDistance * 1.333;
            let points = [];
            let radiusStep = (endRadius - startRadius) / 4 / pointsPerQuarter;

            for (let i=0; i < (quarterTurns * pointsPerQuarter); i++) {
              let radius = startRadius + radiusStep * i;
              let angle = i * Math.PI / 2 / pointsPerQuarter;
              points.push(radius * Math.cos(angle));
              points.push(radius * Math.sin(angle));
            }

            shapes.push(<g key="spiral" transform={`rotate(${angle || 0})`}>
                          <polyline
                            points={points.join(',')}
                            fill="none"
                            stroke={c(spiral)}
                            strokeWidth={spiralWidth}
                            strokeLinecap="round"
                            clipPath={`url(#${clipId})`}
                          />
                        </g>);
          }

          if (curvedStripes) {
            curvedStripesWidth = (width / 25 * curvedStripesWidth) || (width / 4);
            curvedStripesDistance = (width / 25 * curvedStripesDistance) || (width * 0.66);
            shapes.push(<g key="curvedStripes" transform={`rotate(${angle || 0})`}>
                          <path
                            d={`M ${-curvedStripesDistance} -${width} a ${width} ${1.5 * width} 0 0 1 0 ${2 * width}`}
                            fill="none"
                            stroke={c(curvedStripes)}
                            strokeWidth={curvedStripesWidth}
                            clipPath={`url(#${clipId})`}
                          />
                          <path
                            d={`M ${curvedStripesDistance} -${width} a ${width} ${1.5 * width} 0 0 0 0 ${2 * width}`}
                            fill="none"
                            stroke={c(curvedStripes)}
                            strokeWidth={curvedStripesWidth}
                            clipPath={`url(#${clipId})`}
                          />
                        </g>);
          }

          if (stripes) {
            stripesWidth = (width / 25 * stripesWidth) || (width / 4);
            stripesDistance = (width / 25 * stripesDistance) || (width * 0.5);
            shapes.push(<g key="stripes" transform={`rotate(${angle || 0})`}>
                          <rect key="upper"
                                x="-50" y={-stripesDistance - stripesWidth}
                                width="100" height={stripesWidth}
                                fill={c(stripes)}
                                clipPath={`url(#${clipId})`}/>
                          <rect key="lower"
                                x="-50" y={stripesDistance}
                                width="100" height={stripesWidth}
                                fill={c(stripes)}
                                clipPath={`url(#${clipId})`}/>
                        </g>);
          }

          if (stripe) {
            stripeWidth = (width / 25 * stripeWidth) || (width / 2);
            shapes.push(<g key="stripe" transform={`rotate(${angle || 0})`}>
                          <rect key="upper"
                                x={-0.5 * stripeWidth} y="-50"
                                width={stripeWidth} height="100"
                                fill={c(stripe)}
                                clipPath={`url(#${clipId})`}/>
                        </g>);
          }

          if (target) {
            shapes.push(<g key="target">
                          <circle
                            cx="0" cy="0"
                            r={width * 0.625}
                            fill="none"
                            stroke={c(target)}
                            strokeWidth={width / 4}
                            clipPath={`url(#${clipId})`}/>
                        </g>);
          }

          if (bar) {
            barBorderColor = barBorderColor || "black";
            let height = (width / 25 * barHeight) || (width * 0.72);
            let y = height * -0.5;

            shapes.push(
              <rect key="bar" x="-50" y={y} width="100" height={height}
                    fill={bar === true ? p("white") : c(bar)}
                    stroke={p(barBorderColor)}
                    clipPath={`url(#${clipId})`}/>
            );
            textFill = t(bar === true ? p("white") : c(bar));
          }

          if (circle) {
            circleBorderColor = circleBorderColor || "black";
            circleRadius = (width / 25 * circleRadius) || (width * 0.6);

            shapes.push(
              <circle key="circle" cx="0" cy="0"
                      r={circleRadius}
                      fill={circle === true ? p("white") : c(circle)}
                      stroke={p(circleBorderColor)}
                      clipPath={`url(#${clipId})`} />
            );
            textFill = t(circle === true ? p("white") : c(circle));
          }

          // If we specified a labelColor, use it
          if (labelColor) {
            textFill = c(labelColor);
          }
        }

        let content = [];
        if (icon) {
          let iconSvg = icons[icon];
          let Component = iconSvg.Component;

          let classes = [];
          if (iconColor) {
            classes.push(`icon-color-main-${iconColor}`);
          }
          if (reserved) {
            classes.push("color-reserved");
          }

          if (label) {
            // Label and icon, position accordingly
            let x = -0.5 * width;
            let y = -0.75 * width;
            let size = 1 * width;
            content.push(<Component key="icon" className={classes.join(" ")}
                                    x={x} y={y}
                                    height={size} width={size} />);
            content.push(<text
                           key="text"
                           fontFamily="display"
                           fontSize={width * 0.48}
                           textAnchor="middle"
                           strokeWidth="0.5"
                           stroke={textStroke}
                           fill={textFill}
                           x="0"
                           y={(width * 0.12) + 9}
                         >
                           {label}
                         </text>
                        );
          } else {
            let start = -0.75 * width;
            let size = 1.5 * width;
            content.push(<Component key="icon" className={classes.join(" ")}
                                    x={start} y={start}
                                    height={size} width={size} />);
          }
        } else if (label && label.length > 0) {
          let fontSize = width * 0.64;
          let y = width * 0.22;
          if (label.length > 5) {
            fontSize = fontSize * 0.7;
            y = y * 0.7;
          } else if (label.length > 4) {
            fontSize = fontSize * 0.8;
            y = y * 0.8;
          } else if (label.length > 3) {
            fontSize = fontSize * 0.9;
            y = y * 0.9;
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

        let outlineColor = is(String, outline) ? c(outline) : (color === "black" ? s(c(color), -40) : s(c(color)));
        return (
          <g>
            {clip}
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
