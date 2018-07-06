import React from "react";

const Svg = ({ width, height, viewBox, defs, children }) => {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={viewBox}>
      <defs>
        <style>
          @import url("https://fonts.googleapis.com/css?family=Bitter:700");
        </style>
        <clipPath id="hexClip">
          <polygon
            points="0,-86.6025 75,-43.30125 75,43.30125 0,86.6025 -75,43.30125 -75,-43.30125"
            fill="black"
            stroke="none"
          />
        </clipPath>
        {defs}
      </defs>
      {children}
    </svg>
  );
};

export default Svg;
