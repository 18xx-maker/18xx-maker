import React from "react";
import { colors } from "../data";

const Hex = ({ color, border }) => {
  let fill = border ? "transparent" : colors[color];
  let stroke = border ? colors["black"] : "none";

  return (
    <polygon
      points="0,-86.6025 75,-43.30125 75,43.30125 0,86.6025 -75,43.30125 -75,-43.30125"
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="bevel"
      strokeWidth="2"
      stroke={stroke}
    />
  );
};

export default Hex;
