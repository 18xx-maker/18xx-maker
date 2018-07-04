import React from "react";
import { colors } from "../data";

const OffBoardTrack = ({ border }) => {
  let path;

  let width = border ? 7 : 5;
  let color = border ? colors["border"] : colors["track"];
  let end = border ? 30 : 40;

  // Track
  return (
    <g>
      <polygon
        points={`-75,${width} -75,-${width} -${end},0`}
        d={path}
        fill={color}
        stroke="none"
      />
    </g>
  );
};

export default OffBoardTrack;
