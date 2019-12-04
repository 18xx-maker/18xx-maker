import React from "react";
import Color from "../data/Color";

import Currency from "../util/Currency";

const types = {
  cactus: "M 0 0 L 0 -20 M 0 -5 Q -5 -5, -5 -10 M 0 -10 Q 5 -10, 5 -15",
  mountain: "M -15 0 L -10 -5 L -5 0 M 5 0 L 10 -5 L 15 0 M -7.5 -2.5 L 0 -10 L 7.5 -2.5",
  stream: "M -15 -7 Q -7.5 -15, 0 -7 S 7.5 1, 15 -7" +
    "M -15 -2  Q -7.5 -10, 0 -2  S 7.5 6, 15 -2",
  swamp: "M -10 0 Q -10 -5, -15 -5 M -10 0 Q -10 -5, -5 -5" +
    "M 0 -5 Q 0 -10, -5 -10 M 0 -5 Q 0 -10, 5 -10" +
    "M 10 0 Q 10 -5, 15 -5 M 10 0 Q 10 -5, 5 -5",
  river: "M -15 -7 Q -7.5 -15, 0 -7 S 7.5 1, 15 -7" +
    "M -15 -2  Q -7.5 -10, 0 -2  S 7.5 6, 15 -2",
  water: "M -17.5 -5 C -17.5 0, -7.5 0, -7.5 -5 C -7.5 0, 2.5 0, 2.5 -5 C 2.5 0, 12.5 0, 12.5 -5" +
    "M -12.5 -12.5 C -12.5 -7.5, -2.5 -7.5, -2.5 -12.5 C -2.5 -7.5, 7.5 -7.5, 7.5 -12.5 C 7.5 -7.5, 17.5 -7.5, 17.5 -12.5 ",
};
const width = 2;

const Terrain = ({ type, size, cost, color, fontSize }) => {
  fontSize = fontSize || 15;

  let scale = 1;

  if(!color) {
    switch(type) {
    case "river":
    case "stream":
      color = "water";
      break;
    case "swamp":
      color = "land";
      break;
    case "cactus":
      color = "land";
      break;
    case "mountain":
    case "water":
      color = type;
      break;
    default:
      color = "mountain";
      break;
    }
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
          <path
            transform={`translate(0 -4) scale(${scale})`}
            d={types[type]}
            fill="none"
            stroke={p("white")}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            transform={`translate(0 -5) scale(${scale})`}
            d={types[type]}
            fill="none"
            stroke={p(color)}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
