import React, {useContext} from "react";
import Color from "../util/Color";
import GameContext from "../context/GameContext";
import Currency from "../util/Currency";
import { multiDefaultTo } from "../util";

import { icons } from "../data";

const Terrain = ({ type, size, cost, fontFamily, fontSize, color }) => {
  const { game } = useContext(GameContext);
  fontSize = multiDefaultTo(15, fontSize, game.info.valueFontSize);
  fontFamily = multiDefaultTo("display", fontFamily, game.info.valueFontFamily);

  let translate = 0;
  let scale = 1;

  switch(type) {
  case "swamp":
    translate = -10;
    break;
  case "mountain":
    translate = -8;
    break;
  case "cow-skull":
    translate = -18;
    break;
  case "wheat":
    translate = -18;
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

  let icon = null;
  let Component = icons[type];
  if (Component) {
    icon = (
      <g transform={`translate(0 ${translate}) scale(${scale})`}>
        <Component className={`icon-color-main-${color}`}
                   width="25" height="25" x="-12.5" y="-12.5" />
      </g>
    );
  }

  return (
    <Color>
      {(c,t,s,p) => (
        <g>
          {icon}
          <text
            fill={p(color || "black")}
            strokeWidth={(!color || color === "black") ? 0 : 1}
            stroke={c("black")}
            fontSize={fontSize}
            fontFamily={fontFamily}
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
