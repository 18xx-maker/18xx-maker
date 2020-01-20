import React from "react";
import Color from "../data/Color";

const Value = ({ type }) => {
  let icon;

  switch (type) {
  case "medium-city":
    icon = <use href="#medium-city" />
    break;
  case "home":
    icon = <use href="#home" />
    break;
  case "charter":
    icon = <use href="#charter" />
    break;
  case "tracks":
    icon = <use href="#tracks" />
    break;
  case "boat":
    icon = <use href="#boat" />
    break;
  case "mail":
    icon = <use href="#mail" />
    break;
  case "share":
    icon = <use href="#share" />
    break;
  case "bridge":
    icon = <use href="#bridge" />
    break;
  case "tree":
    icon = <use href="#tree" />
    break;
  case "mountain":
    icon = <use href="#mountain" />
    break;
  case "water":
    icon = <use href="#water" />
    break;
  case "river":
    icon = <use href="#river" />
    break;
  case "cactus":
    icon = <use href="#cactus" />
    break;
  case "swamp":
    icon = <use href="#swamp" />
    break;
  case "meat":
    icon = <use href="#meat" />;
    break;
  case "coal":
    icon = <use href="#coal" />;
    break;
  case "port":
  default:
    icon = <use href="#port" />;
    break;
  }

  return (
    <Color>
      {(c,t,s,p) => (
        <g>
          <circle
            fill={p("white")}
            stroke={p("black")}
            strokeWidth="2"
            cx="0"
            cy="0"
            r="15"
          />
          {icon}
        </g>
      )}
    </Color>
  );
};

export default Value;
