import React from "react";
import Color from "../data/Color";

import Name from "./Name";

const Boomtown = ({ border, city, name, color, bgColor, width, strokeWidth }) => {
  width = width || 25;
  let centerTownWidth = width * 5 / 12;
  let boomtownBorderWidth = (width + centerTownWidth) / 2;
  strokeWidth = strokeWidth || 2;
  let strokeDashArray = "6 6";
  if (border) {
    return (
      <Color>
        {c => (
          <circle
            fill={c("border")}
            stroke="none"
            cx="0" cy="0"
            r={city ? width + 3 : centerTownWidth + 4 }
          />
        )}
      </Color>
    );
  } else {
    let nameNode = null;

    if (name) {
      nameNode = (
        <Name
          bgColor={bgColor}
          {...name}
          y={name.y || (name.reverse ? 28 : -28)}
        />
      );
    }
    if (city) {
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
                  r={width}
                />
              </g>
              <g key="city-otherthing">
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  cx="0"
                  cy="0"
                  r={width}
                />
              </g>
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
                  r={boomtownBorderWidth}
                />
              </g>
              {nameNode}
            </React.Fragment>
          )}
        </Color>
      );
    } else {
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
                  r={boomtownBorderWidth+4}
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
