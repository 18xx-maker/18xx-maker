import React from "react";
import Color from "../data/Color";

import Currency from "../util/Currency";

const Terrain = ({ type, size, cost, fontSize }) => {
  fontSize = fontSize || 15;

  let translate = 0;
  let scale = 1;

  switch(type) {
  case "swamp":
    translate = -10;
    break;
  case "mountain":
    translate = -8;
    break;
  default:
    translate = -12;
    break;
  }

  switch(size) {
  case "tiny":
    scale = 0.75;
    break;
  case "medium":
    scale = 1.5;
    break;
  case "large":
    scale = 2;
    break;
  default:
    break;
  }

  return (
    <Color>
      {(c,t,s,p) => (
        <g>
          <g transform={`translate(0 ${translate}) scale(${scale})`}>
            <use href={`#${type}`} />
          </g>
          <text
            fill={p("black")}
            fontSize={fontSize}
            dominantBaseline="hanging"
            textAnchor="middle"
            x="0"
            y="0"
          >
            <Currency value={cost} type="terrain" />
          </text>
        </g>
      )}
    </Color>
  );
};

export default Terrain;
