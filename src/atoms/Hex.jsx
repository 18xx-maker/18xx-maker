import React from "react";
import Color from "../data/Color";

import HexContext from "../context/HexContext";

const Hex = ({ color, border, transparent, map }) => {
  let points = "-98.1495,0 -49.07475,-85 49.07475,-85 98.1495,0 49.07475,85 -49.07475,85";

  return (
    <HexContext.Consumer>
      {hx => (
        <Color context={map ? "map" : "tile"}>
          {(c,t) => {
            let fill = transparent ? "transparent" : c(color);
            if(color && color.includes("/")) {
              console.log("gradient");
              fill = `url(#${color.replace(/\//g, "-")})`;
            }

            return (
              <polygon
                points={points}
                fill={fill}
                strokeLinecap="round"
                strokeLinejoin="bevel"
                strokeWidth="1"
                stroke={fill}
              />
            );
          }}
        </Color>
      )}
    </HexContext.Consumer>
  );
};

export default Hex;
