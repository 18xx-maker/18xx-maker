import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";
import Color from "../data/Color";

import Name from "./Name";

const Boomtown = ({ border, city, name, x, color, bgColor, width, strokeWidth, strokeDashArray, dashed, offset }) => {
  const { config } = useContext(ConfigContext);
  const straightCityNames = config.straightCityNames;

  let cityWidth = width || 25;
  let scale = cityWidth / 25;
  let centerTownWidth = cityWidth * 5 / 12;
  let path = null;
  let nameNode = null;
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
};

export default Boomtown;
