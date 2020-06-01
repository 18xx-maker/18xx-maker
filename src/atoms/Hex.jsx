import React from "react";
import Color from "../data/Color";

const stripeWidth = 28.8675
const Hex = ({ color, border, transparent, map }) => {
  let points = "-98.1495,0 -49.07475,-85 49.07475,-85 98.1495,0 49.07475,85 -49.07475,85";

  return (
    <Color context={map ? "map" : "tile"}>
      {(c,t) => {
        let background = color;
        let stripe = null;
        let stripeRotation = 0;
        if(color && color.includes("/")) {
          [background, stripe] = color.split("/");

          switch (background) {
            case "yellow":
              stripeRotation = -60;
              break;
            case "green":
              stripeRotation = 60;
              break;
            default:
              break;
          }
        }
        let fill = (transparent || background === "none") ? "transparent" : c(background);

        return (
          <g>
            <polygon
              points={points}
              fill={fill}
              strokeLinecap="round"
              strokeLinejoin="bevel"
              strokeWidth="1"
              stroke={fill}
            />
            {stripe && (
              <g transform={`rotate(${stripeRotation})`}>
                <line x1="0" y1="-85" x2="0" y2="85" strokeWidth={stripeWidth} stroke={c(stripe)} />
                <line x1={-2 * stripeWidth} y1="-85" x2={-2 * stripeWidth} y2="85" strokeWidth={stripeWidth} stroke={c(stripe)} />
                <line x1={ 2 * stripeWidth} y1="-85" x2={ 2 * stripeWidth} y2="85" strokeWidth={stripeWidth} stroke={c(stripe)} />
              </g>
            )}
          </g>
        );
      }}
    </Color>
  );
};

export default Hex;
