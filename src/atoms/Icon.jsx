import React from "react";
import Color from "../data/Color";

const Value = ({ type }) => {
  let icon;

  switch (type) {
  case "meat":
    icon = <use href="#meat" />;
    break;
  case "mountain60":
    icon = <use href="#mountain60" />;
    break;
  case "mountain120":
    icon = <use href="#mountain120" />;
    break;
  case "coal":
    icon = <use href="#coal" />;
    break;
  case "port":
  case "steam":
  default:
    icon = <use href="#port" />;
    break;
  }

  return (
    <Color>
      {c => (
        <g>
          <circle
            fill={c("white")}
            stroke={c("black")}
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
