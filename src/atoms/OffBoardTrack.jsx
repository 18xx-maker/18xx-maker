import React from "react";
import { colors } from "../data";

import HexContext from "../context/HexContext";

const OffBoardTrack = ({ border }) => {
  let path;

  let width = border ? 7 : 5;
  let color = border ? colors["border"] : colors["track"];
  let end = border ? 30 : 40;

  // Track
  return (
    <HexContext.Consumer>
      {hx => (
        <g transform={`rotate(${hx.rotation})`}>
          <polygon
            points={`${width},75 -${width},75 0,${end}`}
            d={path}
            fill={color}
            stroke="none"
          />
        </g>
      )}
    </HexContext.Consumer>
  );
};

export default OffBoardTrack;
