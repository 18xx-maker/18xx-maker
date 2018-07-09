import React from "react";
import { colors } from "../data";

import HexContext from "../context/HexContext";

const Hex = ({ color, border }) => {
  let fill = border ? "transparent" : colors[color];
  let stroke = border ? colors["black"] : "none";

  return (
    <HexContext.Consumer>
      {hx => (
        <g transform={`rotate(${hx.rotation})`}>
          <polygon
            points="-86.6025,0 -43.30125,-75 43.30125,-75 86.6025,0 43.30125,75 -43.30125,75"
            fill={fill}
            strokeLinecap="round"
            strokeLinejoin="bevel"
            strokeWidth="2"
            stroke={stroke}
          />
        </g>
      )}
    </HexContext.Consumer>
  );
};

export default Hex;
