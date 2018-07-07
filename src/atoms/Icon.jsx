import React from "react";
import { colors } from "../data";

const Value = ({ type }) => {
  let icon;

  switch (type) {
    case "meat":
      icon = <use href="#meat" />;
      break;
    case "port":
    case "steam":
      icon = <use href="#port" />;
      break;
  }

  return (
    <g>
      <circle
        fill={colors["border"]}
        stroke={colors["track"]}
        strokeWidth="2"
        cx="0"
        cy="0"
        r="15"
      />
      {icon}
    </g>
  );
};

export default Value;
