import React from "react";
import { connect } from "react-redux";
import Color from "../data/Color";

import Name from "./Name";

const Boomtown = ({ straightCityNames, border, city, name, x, color, bgColor, width, strokeWidth, strokeDashArray, offset }) => {
  let cityWidth = width || 25;
  let centerTownWidth = cityWidth * 5 / 12;
  let pathDef = null;
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
      pathWidth -= 7;
      pathDef = `M 0 -${pathWidth} A ${pathWidth} ${pathWidth} 0 0 0 0 ${pathWidth} A ${pathWidth} ${pathWidth} 0 0 0 0 -${pathWidth}`;
    } else {
      pathDef = `M 0 ${pathWidth} A ${pathWidth} ${pathWidth} 0 0 1 0 -${pathWidth} A ${pathWidth} ${pathWidth} 0 0 1 0 ${pathWidth}`;
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
        pathDef={pathDef}
      />
    );
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
};

const mapStateToProps = state => ({
  straightCityNames: state.config.straightCityNames
});

export default connect(mapStateToProps)(Boomtown);
