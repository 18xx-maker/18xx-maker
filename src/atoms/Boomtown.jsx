import React from "react";
import Color from "../data/Color";

import Name from "./Name";

const Boomtown = ({ city, border, name, bgColor, width, strokeWidth }) => {
  width = width || 25;
  strokeWidth = strokeWidth || 2;
  let borderW = 3;
  // let scale = width / 25;

  if (border) {
    // return border of city or center town diameter
    return (
      <Color context="companies">
        {c => (
          <circle
            fill={c("border")}
            stroke="none"
            cx="0" cy="0"
            r={city ? width + borderW : width / 2 + 4}
          />
        )}
      </Color>
    );
  }

  let nameNode = null;

  if (name) {
    nameNode = (
      <Name
        bgColor={bgColor}
        {...name}
        y={name.y || (name.reverse ? 18 : -18)}
      />
    );
  }

  if (city) {
    // return city + center town + transparent dashed circle
    return (
        <Color context="companies">
          {c => (
            <React.fragment>
              <g key="city-fill">
                <circle
                  fill={c("city")}
                  stroke="none"
                  cx="0" cy="0"
                  r={width}
                />
              </g>
              <g key="city-outline">
                <circle
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={strokeWidth}
                  cx="0" cy="0"
                  r={width}
                />
              </g>
              <g key="center-town-outline">
                <circle
                  fill={c("centerTown")}
                  stroke="none"
                  cx="0" cy="0"
                  r={width / 2 + 2}
                />
              </g>
              <g key="center-town-fill">
                <circle
                  fill={c("centerTown")}
                  stroke="none"
                  cx="0" cy="0"
                  r={width / 2}
                />
              </g>
              <g key="boomtown-ring">
                <circle
                  fillOpacity="0"
                  stroke="black"
                  strokeWidth="1"
                  stroke-dasharray="7 7"
                  cx="0" cy="0"
                  r={width * 3 / 4}
                />
              </g>
              {nameNode}
            </React.fragment>
          )}
        </Color>
    );
  } else {
    // return center town + transparent dashed circle
    return (
        <Color context="companies">
          {c => (
            <React.fragment>
              <g key="center-town-outline">
                <circle
                  fill={c("centerTown")}
                  stroke="none"
                  cx="0" cy="0"
                  r={width / 2 + 2}
                />
              </g>
              <g key="center-town-fill">
                <circle
                  fill={c("centerTown")}
                  stroke="none"
                  cx="0" cy="0"
                  r={width / 2}
                />
              </g>
              <g key="boomtown-ring">
                <circle
                  fillOpacity="0"
                  stroke="black"
                  strokeWidth="1"
                  stroke-dasharray="7 7"
                  cx="0" cy="0"
                  r={width * 3 / 4}
                />
              </g>
              {nameNode}
            </React.fragment>
          )}
        </Color>
    );
  }
};

export default Boomtown;
