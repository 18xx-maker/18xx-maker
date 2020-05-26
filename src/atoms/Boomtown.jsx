import React from "react";
import Color from "../data/Color";

import Name from "./Name";

const Boomtown = ({ border, city, name, straightCityNames, color, bgColor, width, strokeWidth, strokeDashArray }) => {
  let cityWidth = width || 25;
  let centerTownWidth = cityWidth * 5 / 12;
  strokeWidth = strokeWidth || 2;
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
  } else {
    let nameNode = null;

    if (name) {
      let path = straightCityNames ? null :
        (city ? "cityPath" : "boomtownCityPath");
      if (path && name.reverse) {
        path = path + "Reverse";
      }
      let y = name.y || (name.reverse ? 7 : 0);
      if (straightCityNames) {
        y -= name.reverse ? -24 : 32;
      }
      nameNode = (
        <Name
          bgColor={bgColor}
          {...name}
          y={y}
          path={path}
          doRotation={true}
        />);
//      nameNode code for centerTowns
//      nameNode = (
//        <Name
//          bgColor={bgColor}
//          {...name}
//          y={name.y || (name.reverse ? 28 : -28)}
//        />
//      );
    }

    if (city) {
      strokeDashArray = strokeDashArray || "4 4";
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
                  stroke-dasharray={strokeDashArray}
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
      strokeDashArray = strokeDashArray || "6 6";
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
                  stroke-dasharray={strokeDashArray}
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
  }
};

export default Boomtown;
