import React from "react";
import Color from "../util/Color";
import RotateContext from "../context/RotateContext";
import CityRotateContext from "../context/CityRotateContext";
import defaultTo from "ramda/src/defaultTo";

import * as uuid from "uuid";

import logos from "../data/logos";
import icons from "../data/icons";

const Token = ({
  logo, // The SVG logo to display on this token.
  logoWidth, // Override the default width of the logo.
  icon, // The path-based icon (defined in App.jsx) to display on this token
  iconWidth, // Override the default width of the icon.
  iconColor, // The color to use for the svg icon or logo
  iconY, // The vertical position of the icon
  label, // The text label to use on this token
  labelColor, // What color to use for writing the label text
  labelY, // Override the calculated vertical position of the label
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

  kiteshield, // color of the top and bottom of the kite shield

  star5, // color of the 5-pointed star
  
  halves, // Colors for halves shape
  quarters, // Colors for quarters shape
  sexies, // Colors for sexies shape
  sunrise, // Colors for sunrise shape
  square, // Draw a square of a certain color on the token
  hexagram, // Colors for dual triangle hexagram shape


  rotation, // Rotation of the token
  fixed, // Cancels all rotation

  tokenShape, // main token shape - square or anything else is circle
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

  let tokClip;
  if (tokenShape === "square") {
    let sqWidth = width * 2 + (bleed ? 10 : 0);
    tokClip=(<rect
      x={-0.5 * sqWidth} y={-0.5 * sqWidth}
      width={sqWidth} height={sqWidth}
    />);
  } else {
    tokClip=(<circle
      cx="0" cy="0" r={width + (bleed ? 5 : 0)}
    />);
  }
  // Create a clipping object for this token
  let clipId = uuid.v4();
  let clip = (
    <clipPath id={clipId}>
      {tokClip}
    </clipPath>
  );
  let shapeMult = 1;
  let scaling = width / 25;

  return (
    <Color>
      {(c,t,s,p) => {
        // Let the text color be specified, or just use the proper color for the
        // token / bar
        let textStroke = c(labelStrokeColor) || "none";
        let textFill = t(c(color) || p("white"));
        let numbersOnlyScaling = 1.6;
        labelStrokeWidth = labelStrokeWidth ? labelStrokeWidth : "0.5";

        // Background fill to use for the main token circle object
        let tokenFill;
        if(inverse) {
          tokenFill = c("white");
        } else if (logo && logos[logo]) {
          tokenFill = c(iconColor) || p("white");
        } else {
          tokenFill = c(color) || p("white");
        }

        let tokInner, tokOuter;
        if (tokenShape === "square") {
          let sqWidth = width * 2 + (bleed ? 10 : 0);
          tokInner=(<rect
            x={-0.5 * sqWidth} y={-0.5 * sqWidth}
            width={sqWidth} height={sqWidth}
            fill={tokenFill} stroke="none"
          />);
          tokOuter=(<rect
            x={-0.5 * sqWidth} y={-0.5 * sqWidth}
            width={sqWidth} height={sqWidth}
            fill="none" stroke={outline || "black"}
            strokeWidth={outlineWidth || 1}
          />);
        } else {
          tokInner=(<circle
            cx="0" cy="0" r={width + (bleed ? 5 : 0)}
            fill={tokenFill} stroke="none"
          />);
          tokOuter=(<circle
            cx="0" cy="0" r={width + (bleed ? 5 : 0)}
            fill="none" stroke={outline || "black"}
            strokeWidth={outlineWidth || 1}
          />);
        }

        if(inverse && logo && logos[logo]) {
          // Draw inversed logos same as reserved
          color = "gray";
          let svg = logos[logo];
          let size = defaultTo(width * 2, logoWidth * scaling);
          let start = -1/2 * size;
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
          textStroke = "none";
          textFill = "none";

        } else if(inverse) {
          // Inverse tokens are always white with colored text
          textStroke = s(c(inverseLabelColor == null ? color : inverseLabelColor));
          textFill = c(inverseLabelColor == null ? color : inverseLabelColor);

        } else if (logo && logos[logo]) {
          let svg = logos[logo];
          let size = defaultTo(width * 2, logoWidth * scaling);
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

          if (sunrise) {
            shapes.push(<g key="sunrise" transform={`rotate(${shapeAngle || 0})`}>
                          <rect key="upper" x="-50" y="-50" width="100" height="50"
                                fill={c(sunrise[1])}
                                clipPath={`url(#${clipId})`}/>
                          <rect key="lower" x="-50" y="0" width="100" height="50"
                                fill={c(sunrise[0])}
                                clipPath={`url(#${clipId})`}/>
                          <polygon key="sunrise-1" points="0 0 35.35534 -35.35534 12.94095 -49.29629"
                                fill={c(sunrise[2])}
                                clipPath={`url(#${clipId})`}/>
                          <polygon key="sunrise-2" points="0 0 -35.35534 -35.35534 -12.94095 -49.29629"
                                fill={c(sunrise[2])}
                                clipPath={`url(#${clipId})`}/>
                        </g>);
          }

          if (sexies) {
            shapes.push(<g key="sexies" transform={`rotate(${shapeAngle || 0})`}>
                          <polygon key="sexies-1" points="0 0 50 0 25 43.30127"
                                fill={c(sexies[0])}
                                clipPath={`url(#${clipId})`}/>
                          <polygon key="sexies-2" points="0 0 25 43.30127 -25 43.30127"
                                fill={c(sexies[1])}
                                clipPath={`url(#${clipId})`}/>
                          <polygon key="sexies-3" points="0 0 -25 43.30127 -50 0"
                                fill={c(sexies[0])}
                                clipPath={`url(#${clipId})`}/>
                          <polygon key="sexies-4" points="0 0 -50 0 -25 -43.30127"
                                fill={c(sexies[1])}
                                clipPath={`url(#${clipId})`}/>
                          <polygon key="sexies-5" points="0 0 -25 -43.30127 25 -43.30127"
                                fill={c(sexies[0])}
                                clipPath={`url(#${clipId})`}/>
                          <polygon key="sexies-6" points="0 0 25 -43.30127 50 0"
                                fill={c(sexies[1])}
                                clipPath={`url(#${clipId})`}/>
                        </g>);
          }

          if (hexagram) {
            let hexagramTop = scaling * 23
            let hexagramSide = scaling * 19.91858
            let hexagramBottom = scaling * 11.5

            shapes.push(<g key="hexagram" transform={`rotate(${shapeAngle || 0})`}>
                          <polygon points={`${hexagramSide} -${hexagramBottom} -${hexagramSide} -${hexagramBottom} 0 ${hexagramTop}`}
                                fill={c(hexagram[1])}
                                clipPath={`url(#${clipId})`}/>
                          <polygon points={`${hexagramSide} ${hexagramBottom} -${hexagramSide} ${hexagramBottom} 0 -${hexagramTop}`}
                                fill={c(hexagram[0])}
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
            let height = (width / 25 * barHeight) || (width * 0.75);
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
            let fillColor = shield === true ? p("white") : c(shield);
            if ((reserved || inverse) && shieldTop) {
              textFill = c(shieldTop);
            } else {
              textFill = defaultTo(t(fillColor), labelColor);
            }
            shapeMult = 0.5;
          shapes.push(<g key="shield" width={`${wh}`} height={`${wh}`} transform={`translate(${trans}, ${trans}) scale(${scale})`}>
                          <path
                            fill={fillColor}
                            d="M515 314.2c15.1 32.1 18.4 41.5 17.9 70.7-1.5 97.2-76 115.6-117 115-28.6-.4-76.5 2-109.4 32.7h-.8c-32.9-30.7-80.8-33.2-109.4-32.7-41 .6-115.5-17.8-117-115-.5-29.1 2.9-38.7 17.9-70.7 22.9-34.1 15.3-108.1 15.3-108.1h387.2c-8.4 33.9-7.7 74 15.3 108.1z"/>
                          <path
                            fill="none"
                            stroke="black"
                            strokeWidth="20"
                            d="M112.5 206.1s7.6 74-15.3 108.1c-15 32-18.4 41.6-17.9 70.7 1.5 97.2 76 115.6 117 115 28.6-.5 76.5 2 109.4 32.7h.8c32.9-30.7 80.8-33.1 109.4-32.7 41 .6 115.5-17.8 117-115 .5-29.2-2.8-38.6-17.9-70.7-23-34.1-23.7-74.2-15.3-108.1H112.5z"/>
                          <path
                            fill={(reserved || inverse) ? "gray" : (shieldTop ? c(shieldTop) : c("blue"))}
                            d="M527.4 145.7c-26.7 18.6-27.8 60.4-27.8 60.4H112.5s-3.7-44.7-27.8-60.4c26.8-27 64.6-66.3 64.6-66.3s71.1 65.8 156.7 1.3c85.5 64.5 156.7-1.3 156.7-1.3s37.9 39.2 64.7 66.3z"/>
                          <path
                            fill="none"
                            stroke="black"
                            strokeWidth="20" d="M112.5 206.1s-3.7-44.7-27.8-60.4c26.8-27 64.6-66.3 64.6-66.3s71.1 65.8 156.7 1.3c85.5 64.5 156.7-1.3 156.7-1.3s37.9 39.2 64.6 66.3c-26.7 18.6-27.8 60.4-27.8 60.4h-387z"/>
                        </g>);
        }

        if (shield3) {
            let scale = scaling * 0.09;
            let trans = scaling * -27;
            let wh = scaling * 50;
            let fillColor = shield3 === true ? p("white") : c(shield3);
            if ((reserved || inverse) && shield3TopCenter) {
              textFill = c(shield3TopCenter);
            } else {
              textFill = defaultTo(t(fillColor), labelColor);
            }
            shapeMult = 0.8;
            shapes.push(<g key="shield3" width={`${wh}`} height={`${wh}`} transform={`translate(${trans}, ${trans}) scale(${scale})`}>
                          <path
                            fill={fillColor}
                            d="M514.8 313.8c15.1 32 18.4 41.6 17.9 70.7-1.6 97.2-76 115.6-117 115-28.5-.4-76.4 2.1-109.3 32.7h-.9c-32.9-30.7-80.8-33.1-109.3-32.7-41 .6-115.4-17.8-117-115-.4-29.1 2.9-38.7 17.9-70.7 23-34.1 15.4-108 15.4-108h386.9c-8.2 33.8-7.6 73.9 15.4 108z"/>
                          <path
                            fill="none"
                            stroke="black"
                            strokeWidth="20"
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
                          <g fill="none" stroke="black" strokeWidth="20">
                            <path d="M236.9 206.5l-124.4-.7s-3.8-41.7-27.7-57.3c11.2-11.3 64.7-66.2 64.7-66.2s22.8 28.1 87.4 29.3m139.8-2.4c66.2-2.7 85.9-29.4 85.9-29.4s37.9 39.2 64.7 66.2c-20.1 21-27.7 60.4-27.7 60.4H377.7"/>
                            <path d="M376.7 109.2c-43.8-5.8-56.4-17.4-70.7-28.1-20.5 18.7-69.1 30.4-69.1 30.4v94.9h140.8l-1-97.2z"/>
                          </g>
                        </g>);
        }

        if (kiteshield) {
            let scale = scaling * 0.076;
            let transX = scaling * -23.5;
            let transY = scaling * -21.5;
            let wh = scaling * 50;
            let fillColor = kiteshield === true ? p("white") : c(kiteshield);
            labelY -= scaling * 1.8;
            if ((reserved || inverse) && kiteshield) {
              textFill = c(kiteshield);
            } else {
              textFill = defaultTo(t(fillColor), labelColor);
            }
            shapeMult = 0.75;
            shapes.push(
            <g key="kiteshield" width={`${wh}`} height={`${wh}`}
               transform={`translate(${transX}, ${transY}) scale(${scale})`}>
              <g>
                <path fill={fillColor}
                  stroke="black"
                  strokeWidth="10"
                  d="M509.1,383.3c-35.1,83.4-96.7,165.2-203.8,216.5c-106.6-51.6-168-133.5-202.8-217"/>
                <path fill={fillColor}
                  stroke="black"
                  strokeWidth="10"
                  d="M58.5,132.9c0.7-29.8,3.1-47.9,3.1-47.9s177.8-17,244.3-72.8c66.5,55.7,244.4,72.1,244.4,72.1 s2.5,18.4,3.1,48.5"/>
              </g>
              <g>
                <path 
                  fill="none"
                  stroke="black"
                  strokeWidth="10"
                  d="M509.1,383.3c-147.8,0.6-258.4-0.4-406.6-0.4"/>
                <path
                  fill="none"
                  stroke="black"
                  strokeWidth="10"
                  d="M58.5,132.9c180.3-0.3,314.6,0.3,494.9,0"/>
                <path
                  fill="none"
                  stroke="black"
                  strokeWidth="10"
                  d="M553.5,132.8c1.2,56.6-4.1,154.6-44.4,250.5"/>
                <path
                  fill="none"
                  stroke="black"
                  strokeWidth="10"
                  d="M58.5,132.9c-1.3,56.3,3.9,154.1,43.9,250"/>
              </g>
             </g>);
        }

        if (star5) {
          let scale = 1 * scaling;
          let transX = scale * -25;
          let transY = scale * -25;
          let wh = scale * 50;
          let fillColor = star5 === true ? p("white") : c(star5);
          labelY += scale * 3;
          if ((reserved || inverse) && star5) {
            textFill = "gray";
          } else {
            textFill = defaultTo(t(fillColor), labelColor);
          }
          shapeMult = 0.75;
          shapes.push(
            <g key="star5" width={`${wh}`} height={`${wh}`}
              transform={`translate(${transX}, ${transY}) scale(${scale})`}>
              <path d="m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z"
                fill="red"
                stroke={outline || "black"}
                strokeWidth={outlineWidth || 1}
              />
            </g>
          );
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
            let size = defaultTo(width * 2, iconWidth * scaling);
            let x = -0.5 * size;
            let y = iconY || -0.95 * size;
            let fSize;
            content.push(<Component key="icon" className={classes.join(" ")}
                                    x={x} y={y}
                                    height={size} width={size} />);
            if (fontSize) {
              fSize = fontSize * scaling;
            } else {
              fSize = width * 0.48;
              if (label.length > 5) {
                fSize *= 0.7;
              } else if (label.length > 4) {
                fSize *= 0.8;
              } else if (label.length > 3) {
                fSize *= 0.9;
              }
            }
            if (!isNaN(label)) {
              fSize *= numbersOnlyScaling;
            }
            if (labelY) {
              y = labelY;
            } else {
              y = fSize * 11 / 32 + 12;
              if (shield || shield3) {
                fSize *= scaling;
                y += scaling * 5;
              }
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
            let size = defaultTo(width * 2, logoWidth * scaling) * 0.75;
            let start = -0.5 * size;
            let y = iconY || start;
            content.push(<Component key="icon" className={classes.join(" ")}
                                    x={start} y={y}
                                    height={size} width={size} />);
          }
        } else if (label && label.length > 0) {
          let fSize;
          if (fontSize) {
            fSize = fontSize * scaling;
          } else {
            fSize = width * .7 * shapeMult;
            if (label.length > 5) {
              fSize *= 0.6;
            } else if (label.length > 4) {
              fSize *= 0.7;
            } else if (label.length > 3) {
              fSize *= 0.8;
            }
            if (!isNaN(label)) {
              fSize *= numbersOnlyScaling;
            }
          }

          /* W, M, and N are wider than average, so shrink to accomodate */
          fSize *= 0.85 ** (label.match(/W/g)||[]).length;
          fSize *= 0.9 ** (label.match(/M/g)||[]).length;
          fSize *= 0.95 ** (label.match(/N/g)||[]).length;

          let y = fSize * 11 / 32;
          if (shield || shield3) {
            fSize *= scaling;
            y += scaling * 5;
          }
          if (labelY) {
            y = labelY;
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
        return (
          <RotateContext.Consumer>
          {rotateContext => (
          <CityRotateContext.Consumer>
          {cityRotateContext => (
          <g transform={`rotate(${fixed ? 0 : (rotateContext.fixed ? 0 : -rotateContext.angle - (rotation || 0)) - (cityRotateContext || 0)})`}>
            {clip}
            <g clipPath={`url(#${clipId})`}>
              <g transform={`rotate(${shapeAngle || 0})`}>
                {tokInner}
              </g>
              {shapes}
              {content}
            </g>
            {tokOuter}
          </g>
          )}
          </CityRotateContext.Consumer>
          )}
          </RotateContext.Consumer>
        );
      }}
    </Color>
  );
};

export default Token;
