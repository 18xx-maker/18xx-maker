import React from "react";
import Color from "../data/Color";

import HexContext from "../context/HexContext";

const Hex = ({ color, border, transparent, map }) => {
  return (
      <HexContext.Consumer>
        {hx => (
          <Color context={map ? "map" : "tile"}>
            {(c,t) => {
              return (
                <g transform={`rotate(${hx.rotation})`}>
                  <polygon
                    points="-86.6025,0 -43.30125,-75 43.30125,-75 86.6025,0 43.30125,75 -43.30125,75"
                    fill={border || transparent ? "transparent" : c(color)}
                    strokeLinecap="round"
                    strokeLinejoin="bevel"
                    strokeWidth="2"
                    stroke={border ? c("black") : "none"}
                  />
                </g>
              );
            }}
          </Color>
        )}
      </HexContext.Consumer>
  );
};

export default Hex;
