import React from "react";
import Color from "../data/Color";

import * as uuid from "uuid";

import logos from "../data/logos";
import icons from "../data/icons";

import is from "ramda/src/is";

const Token = ({
  logo, // The SVG logo to display on this token.
  logoWidth, // Override the default width of the logo.
  icon, // The path-based icon (defined in App.jsx) to display on this token
  iconWidth, // Override the default width of the icon.
  iconColor, // The color to use for the svg icon
  label, // The text label to use on this token
  labelColor, // What color to use for writing the label text
  color, // What color is this token using as a background
  labelStrokeColor, // What color to use for the stroke of the label
  labelStrokeWidth, // What width to use for the stroke of the label
  shapeAngle, // Angle for the shapes, independent of the positioning angle

  type, // What special type of token to render (for special shapes and patterns)
  bar, // Do we add a white bar around the text?
  barHeight, // Height override for white bar
  barBorderColor, // Color of borders

  fontSize, // size of font to use
  fontFamily, // font family

  width, // Set the width directly, overrides the "destination" option
  destination, // Is this a destination token? Sets a smaller default width
  reserved, // Is this a reserved token? Sets it to a gray color
  inverse, // Should we render the "inverse" of this token? No logos, only text
  inverseLabelColor, //What color to use for the label text on "inverse" tokens

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

  shield, // Color of the body of the shield
  shieldTop, // Color of the top of the shield

  shield3, // Color of the body of the shield
  shield3TopLeft, // Color of the top of the shield
  shield3TopCenter, // Color of the top of the shield
  shield3TopRight, // Color of the top of the shield

  halves, // Colors for halves shape
  quarters, // Colors for quarters shape
  square, // Draw a square of a certain color on the token
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
        let textStroke = c(labelStrokeColor) || "none";
        let textFill = t(c(color) || p("white"));
        let scaling = width / 25;
        let numbersOnlyScaling = 1.6;
        labelStrokeWidth = labelStrokeWidth ? labelStrokeWidth : "0.5";

        // Background fill to use for the main token circle object
        let tokenFill = c(color) || p("white");

        if(inverse && logo && logos[logo]) {
          // Draw inversed logos same as reserved
          color = "gray";
          let svg = logos[logo];
          let start = -1 * width;
          let size = 2 * width;
          let Component = svg.Component;
          if (logo.includes("countries")) {
            shapes.push(
              <Component key="logo" className={`color-main-${color} color-reserved`}
                         x={start} y={start}
                         preserveAspectRatio="xMidYMid slice"
                         height={size} width={size}/>
            );
          } else {
            shapes.push(
              <Component key="logo" className={`color-main-${color} color-reserved`}
                         x={start} y={start}
                         height={size} width={size}/>
            );
          }
          tokenFill = c("white");
          textStroke = "none";
          textFill = "none";

        } else if(inverse) {
          // Inverse tokens are always white with colored text
          textStroke = s(c(inverseLabelColor == null ? color : inverseLabelColor));
          textFill = c(inverseLabelColor == null ? color : inverseLabelColor);
          tokenFill = c("white");

        } else if (logo && logos[logo]) {
          let svg = logos[logo];
          let size = logoWidth || 2 * width;
          let start = -1/2 * size;
          let Component = svg.Component;
          if (logo.includes("countries")) {
            shapes.push(
              <Component key="logo" className={`color-main-${color}${reserved ? " color-reserved" : ""}`}
                         x={start} y={start}
                         preserveAspectRatio="xMidYMid slice"
                         height={size} width={size}/>
            );
          } else {
            shapes.push(
              <Component key="logo" className={`color-main-${color}${reserved ? " color-reserved" : ""}`}
                         x={start} y={start}
                         height={size} width={size}/>
            );
          }
          tokenFill = c("white");
          textStroke = "none";
          textFill = "none";

        } else {

          if (square) {
            shapes.push(
              <g key="square" transform={`rotate(${shapeAngle || 0})`}>
                <rect rx={width * 0.08} ry={width * 0.08}
                      x={width * -0.75} y={width * -0.75}
                      width={width * 1.5} height={width * 1.5}
                      fill={c(square)} />
              </g>
            );
            textFill = t(c(square));
          }

          if (quarters) {
            shapes.push(<g key="quarters" transform={`rotate(${shapeAngle || 0})`}>
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
            shapes.push(<g key="halves" transform={`rotate(${shapeAngle || 0})`}>
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

            shapes.push(<g key="spiral" transform={`rotate(${shapeAngle || 0})`}>
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
            shapes.push(<g key="curvedStripes" transform={`rotate(${shapeAngle || 0})`}>
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
            shapes.push(<g key="stripes" transform={`rotate(${shapeAngle || 0})`}>
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
            shapes.push(<g key="stripe" transform={`rotate(${shapeAngle || 0})`}>
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

        if (shield) {
            let scale = scaling * 0.09;
            let trans = scaling * -27;
            let wh = scaling * 50;
            if ((reserved || inverse) && shieldTop) {
              textFill = c(shieldTop);
            }
            shapes.push(<g width={`${wh}`} height={`${wh}`} transform={`translate(${trans}, ${trans}) scale(${scale})`}>
                        <path
                          fill={shield === true ? p("white") : c(shield)}
                          d="M515 314.2c15.1 32.1 18.4 41.5 17.9 70.7-1.5 97.2-76 115.6-117 115-28.6-.4-76.5 2-109.4 32.7h-.8c-32.9-30.7-80.8-33.2-109.4-32.7-41 .6-115.5-17.8-117-115-.5-29.1 2.9-38.7 17.9-70.7 22.9-34.1 15.3-108.1 15.3-108.1h387.2c-8.4 33.9-7.7 74 15.3 108.1z"/>
                        <path
                          fill="none"
                          stroke="black"
                          stroke-width="20"
                          d="M112.5 206.1s7.6 74-15.3 108.1c-15 32-18.4 41.6-17.9 70.7 1.5 97.2 76 115.6 117 115 28.6-.5 76.5 2 109.4 32.7h.8c32.9-30.7 80.8-33.1 109.4-32.7 41 .6 115.5-17.8 117-115 .5-29.2-2.8-38.6-17.9-70.7-23-34.1-23.7-74.2-15.3-108.1H112.5z"/>
                        <path
                          fill={(reserved || inverse) ? "gray" : (shieldTop ? c(shieldTop) : c("blue"))}
                          d="M527.4 145.7c-26.7 18.6-27.8 60.4-27.8 60.4H112.5s-3.7-44.7-27.8-60.4c26.8-27 64.6-66.3 64.6-66.3s71.1 65.8 156.7 1.3c85.5 64.5 156.7-1.3 156.7-1.3s37.9 39.2 64.7 66.3z"/>
                        <path
                          fill="none"
                          stroke="black"
                          stroke-width="20" d="M112.5 206.1s-3.7-44.7-27.8-60.4c26.8-27 64.6-66.3 64.6-66.3s71.1 65.8 156.7 1.3c85.5 64.5 156.7-1.3 156.7-1.3s37.9 39.2 64.6 66.3c-26.7 18.6-27.8 60.4-27.8 60.4h-387z"/>
                        </g>);
        }

        if (shield3) {
            let scale = scaling * 0.09;
            let trans = scaling * -27;
            let wh = scaling * 50;
            if ((reserved || inverse) && shield3TopCenter) {
              textFill = c(shield3TopCenter);
            }
            shapes.push(<g width={`${wh}`} height={`${wh}`} transform={`translate(${trans}, ${trans}) scale(${scale})`}>
                        <path
                          fill={shield3 === true ? p("white") : c(shield3)}
                          d="M514.8 313.8c15.1 32 18.4 41.6 17.9 70.7-1.6 97.2-76 115.6-117 115-28.5-.4-76.4 2.1-109.3 32.7h-.9c-32.9-30.7-80.8-33.1-109.3-32.7-41 .6-115.4-17.8-117-115-.4-29.1 2.9-38.7 17.9-70.7 23-34.1 15.4-108 15.4-108h386.9c-8.2 33.8-7.6 73.9 15.4 108z"/>
                        <path
                          fill="none"
                          stroke="black"
                          stroke-width="20"
                          d="M112.5 205.8s7.6 73.9-15.4 108c-15 32-18.3 41.6-17.9 70.7 1.6 97.2 76 115.6 117 115 28.5-.4 76.4 2 109.3 32.7h.9c32.9-30.6 80.8-33.1 109.3-32.7 41 .6 115.4-17.8 117-115 .5-29.1-2.8-38.7-17.9-70.7-23-34.1-23.6-74.2-15.4-108H112.5z"/>
                        <path
                          fill={(reserved || inverse) ? "gray" : (shield3TopLeft ? c(shield3TopLeft) : c("red"))}
                          d="M84.8 148.5c11.2-11.3 64.7-66.2 64.7-66.2s22.8 28.1 87.4 29.3v94.9l-124.4-.7s-3.8-41.7-27.7-57.3z"/>
                        <path
                          fill={(reserved || inverse) ? "gray" : (shield3TopCenter ? c(shield3TopCenter) : c("white"))}
                          d="M236.9 111.6s48.6-11.7 69.1-30.4c14.2 10.7 26.9 22.3 70.7 28.1l1 97.2H236.9v-94.9z"/>
                        <path
                          fill={(reserved || inverse) ? "gray" : (shield3TopRight ? c(shield3TopRight) : c("blue"))}
                            d="M527.2 146c-20.1 21-27.7 60.4-27.7 60.4H377.7l-1-97.2c66.2-2.7 85.9-29.4 85.9-29.4s37.8 39.2 64.6 66.2z"/>
                        <g fill="none" stroke="black" stroke-width="20">
                            <path d="M236.9 206.5l-124.4-.7s-3.8-41.7-27.7-57.3c11.2-11.3 64.7-66.2 64.7-66.2s22.8 28.1 87.4 29.3m139.8-2.4c66.2-2.7 85.9-29.4 85.9-29.4s37.9 39.2 64.7 66.2c-20.1 21-27.7 60.4-27.7 60.4H377.7"/>
                            <path d="M376.7 109.2c-43.8-5.8-56.4-17.4-70.7-28.1-20.5 18.7-69.1 30.4-69.1 30.4v94.9h140.8l-1-97.2z"/>
                        </g>
                        </g>);
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
            let size = iconWidth || 1 * width;
            let x = -0.5 * size;
            let y = -1 * size;
            let fSize;
            content.push(<Component key="icon" className={classes.join(" ")}
                                    x={x} y={y}
                                    height={size} width={size} />);
            if (fontSize) {
              fSize = fontSize;
            } else {
              fSize = width * 0.48;
              if (label.length > 5) {
                fSize = fSize * 0.7;
              } else if (label.length > 4) {
                fSize = fSize * 0.8;
              } else if (label.length > 3) {
                fSize = fSize * 0.9;
              }
            }
            if (!isNaN(label)) {
              fSize *= numbersOnlyScaling;
            }
            y = fSize * 11 / 32 + 12;
            if (shield || shield3) {
              fSize *= scaling;
              y += scaling * 5;
            }
            content.push(<text
                           key="text"
                           fontFamily={fontFamily || "display"}
                           fontSize={fSize}
                           textAnchor="middle"
                           strokeWidth={labelStrokeWidth}
                           stroke={textStroke}
                           fill={textFill}
                           x="0"
                           y={y}
                         >
                           {label}
                         </text>
                        );
          } else {
            let size = iconWidth || 1.5 * width;
            let start = -0.5 * size;
            content.push(<Component key="icon" className={classes.join(" ")}
                                    x={start} y={start}
                                    height={size} width={size} />);
          }
        } else if (label && label.length > 0) {
          let fSize;
          if (fontSize) {
            fSize = fontSize;
          } else {
            fSize = width * 0.64;
            if (label.length > 5) {
              fSize = fSize * 0.7;
            } else if (label.length > 4) {
              fSize = fSize * 0.8;
            } else if (label.length > 3) {
              fSize = fSize * 0.9;
            }
            if (!isNaN(label)) {
              fSize *= numbersOnlyScaling;
            }
          }
          let y = fSize * 11 / 32;
          if (shield || shield3) {
            fSize *= scaling;
            y += scaling * 5;
          }
          content.push(<text
                         key="text"
                         fontFamily={fontFamily || "display"}
                         fontSize={fSize}
                         textAnchor="middle"
                         strokeWidth={labelStrokeWidth}
                         stroke={textStroke}
                         fill={textFill}
                         x="0"
                         y={y}
                       >
                         {label}
                       </text>
                      );
        }

        let outlineColor = is(String, outline) ? c(outline) : 
          ((inverse && inverseLabelColor != null) ? (inverseLabelColor === "black" ? s(c(inverseLabelColor), -40) : s(c(inverseLabelColor))) : 
                                                    (color === "black" ? s(c(color), -40) : s(c(color))));
        return (
          <g>
            {clip}
            <g clipPath={`url(#${clipId})`}>
              <g transform={`rotate(${shapeAngle || 0})`}>
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
            </g>
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
