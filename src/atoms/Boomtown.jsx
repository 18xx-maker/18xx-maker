import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";
import Color from "../util/Color";

import Name from "./Name";

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

const Boomtown = ({ border, city, size, name, x, color, bgColor, width, strokeWidth, strokeDashArray, dashed, offset }) => {
  const { config } = useContext(ConfigContext);
  const straightCityNames = config.straightCityNames;

  if (size === undefined) {
    size = 1;
  }

  let cityWidth = width || 25;
  let scale = cityWidth / 25;
  let centerTownWidth = cityWidth * 5 / 12;
  let path = null;
  let nameNode = null;
  strokeWidth = strokeWidth || 2;

  if (size === 1) {
    if (border) {
      return (
        <Color>
          {c => (
            <circle
              fill={c("border")}
              stroke="none"
              cx="0" cy="0"
              r={city ? cityWidth + 3 : centerTownWidth + 4 }
            />
          )}
        </Color>
      );
    }
  
    if (name && !straightCityNames && !name.straight) {
      let pathWidth = cityWidth + 5;
      if (name.reverse) {
        path = `M 0 -${pathWidth} A ${pathWidth} ${pathWidth} 0 0 0 0 ${pathWidth} A ${pathWidth} ${pathWidth} 0 0 0 0 -${pathWidth}`;
      } else {
        path = `M 0 ${pathWidth} A ${pathWidth} ${pathWidth} 0 0 1 0 -${pathWidth} A ${pathWidth} ${pathWidth} 0 0 1 0 ${pathWidth}`;
      }
    }
  
    if (name) {
      let x = name.x || 0;
      let y = name.y || (name.reverse ? 7 : 0);
      if (straightCityNames || name.straight) {
        y -= name.reverse ? -cityWidth : cityWidth + 8;
      }
      //if (straightCityNames) {
       // y -= name.reverse ? -20 : 28;
      //}
  
      nameNode = (
        <Name
          bgColor={bgColor}
          {...name}
          x={x}
          y={y}
          doRotation={true}
          path={path}
        />
      );
    }
  
    if (city) {
      // dashed true is default, so false is what to watch for
      strokeDashArray = strokeDashArray ||
        dashed === false ? "1 0" : `${scale * 4}`;
      return (
        <Color context="companies">
          {c => (
            <React.Fragment>
              <g key="city">
                <circle
                  fill={c("city")}
                  stroke="none"
                  cx="0"
                  cy="0"
                  r={cityWidth}
                />
              </g>
              <g key="city-otherthing">
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  cx="0"
                  cy="0"
                  r={cityWidth}
                />
              </g>
              <g key="boomtown-outline">
                <circle
                  fill="none"
                  stroke="black"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDashArray}
                  cx="0" cy="0"
                  r={centerTownWidth}
                />
              </g>
              {nameNode}
            </React.Fragment>
          )}
        </Color>
      );
    } else {
      // dashed true is default, so false is what to watch for
      strokeDashArray = strokeDashArray ||
        dashed === false ? "1 0" : `${scale * 6}`;
      return (
        <Color context="companies">
          {c => (
            <React.Fragment>
              <g key="center-town-outline">
                <circle
                  fill={c("centerTown")}
                  stroke="none"
                  cx="0" cy="0"
                  r={centerTownWidth + 2}
                />
              </g>
              <g key="center-town-fill">
                <circle
                  fill={c(color || "centerTown")}
                  stroke="none"
                  cx="0" cy="0"
                  r={centerTownWidth}
                />
              </g>
              <g key="boomtown-outline">
                <circle
                  fill="none"
                  stroke="black"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDashArray}
                  cx="0" cy="0"
                  r={cityWidth}
                />
              </g>
              {nameNode}
            </React.Fragment>
          )}
        </Color>
      );
    }
  } else if (size === 2) {
    if (border) {
      let borderWidth = city ? cityWidth + 2 : centerTownWidth + 6;
      return (
        <Color>
          {c => (
          <g>
            <path d={`M${borderWidth-1},${borderWidth+1} A${borderWidth},${borderWidth+1} 0 1,0 ${borderWidth-1},-${borderWidth+1} L-${borderWidth-1},-${borderWidth+1} A${borderWidth},${borderWidth+1} 0 1,0 -${borderWidth-1},${borderWidth+1} L${borderWidth-1},${borderWidth+1}`}
              fill={c("border")}
              stroke="none"
            />
          </g>
          )}
        </Color>
      );
    }
  
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
  
    if (city) {
      // dashed true is default, so false is what to watch for
      strokeDashArray = strokeDashArray ||
        dashed === false ? "1 0" : `${scale * 4}`;
      return (
        <Color context="companies">
          {c => (
            <React.Fragment>
              <g key="city">
                <circle
                  fill={c("city")}
                  stroke="none"
                  cx={`${cityWidth}`}
                  cy="0"
                  r={cityWidth}
                />
              </g>
              <g key="city-otherthing">
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  cx={`${cityWidth}`}
                  cy="0"
                  r={cityWidth}
                />
              </g>
              <g key="boomtown-outline">
                <circle
                  fill="none"
                  stroke="black"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDashArray}
                  cx={`${cityWidth}`}
                  cy="0"
                  r={centerTownWidth}
                />
              </g>
              <g key="city2">
                <circle
                  fill={c("city")}
                  stroke="none"
                  cx={`-${cityWidth}`}
                  cy="0"
                  r={cityWidth}
                />
              </g>
              <g key="city2-otherthing">
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  cx={`-${cityWidth}`}
                  cy="0"
                  r={cityWidth}
                />
              </g>
              <g key="boomtown2-outline">
                <circle
                  fill="none"
                  stroke="black"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDashArray}
                  cx={`-${cityWidth}`}
                  cy="0"
                  r={centerTownWidth}
                />
              </g>
              <g>
                <path d={`M-${cityWidth},${cityWidth} L${cityWidth},${cityWidth}`} stroke="black" strokeWidth={strokeWidth}/>
                <path d={`M-${cityWidth},-${cityWidth} L${cityWidth},-${cityWidth}`} stroke="black" strokeWidth={strokeWidth}/>
              </g>
              {nameNode}
            </React.Fragment>
          )}
        </Color>
      );
    } else {
      // dashed true is default, so false is what to watch for
      strokeDashArray = strokeDashArray ||
        dashed === false ? "1 0" : `${scale * 6}`;
      return (
        <Color context="companies">
          {c => (
            <React.Fragment>
              <g key="outline">
                <path d={`M${centerTownWidth+4},${centerTownWidth+4} A${centerTownWidth+4},${centerTownWidth+4} 0 1,0 ${centerTownWidth+4},-${centerTownWidth+4} L-${centerTownWidth+4},-${centerTownWidth+4} A${centerTownWidth+4},${centerTownWidth+4} 0 1,0 -${centerTownWidth+4},${centerTownWidth+4} L${centerTownWidth+4},${centerTownWidth+4}`}
                fill={c("white")}
                stroke={c("track")}
                strokeWidth="2"
                />
              </g>
              <g key="center-town-outline">
                <circle
                  fill={c("centerTown")}
                  stroke="none"
                  cx={`-${centerTownWidth+3}`}
                  cy="0"
                  r={centerTownWidth + 2}
                />
              </g>
              <g key="center-town-fill">
                <circle
                  fill={c(color || "centerTown")}
                  stroke="none"
                  cx={`-${centerTownWidth+3}`}
                  cy="0"
                  r={centerTownWidth}
                />
              </g>
              <g key="boomtown-outline">
                <circle
                  fill="none"
                  stroke="black"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDashArray}
                  cx={`-${centerTownWidth+3}`}
                  cy="0"
                  r={cityWidth}
                />
              </g>
              <g key="center-town2-outline">
                <circle
                  fill={c("centerTown")}
                  stroke="none"
                  cx={`${centerTownWidth+3}`}
                  cy="0"
                  r={centerTownWidth + 2}
                />
              </g>
              <g key="center-town2-fill">
                <circle
                  fill={c(color || "centerTown")}
                  stroke="none"
                  cx={`${centerTownWidth+3}`}
                  cy="0"
                  r={centerTownWidth}
                />
              </g>
              <g key="boomtown2-outline">
                <circle
                  fill="none"
                  stroke="black"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDashArray}
                  cx={`${centerTownWidth+3}`}
                  cy="0"
                  r={cityWidth}
                />
              </g>
              {nameNode}
            </React.Fragment>
          )}
        </Color>
      );
    }
  }
};

export default Boomtown;
