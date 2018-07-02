import React from "react";
import util from "./util";
import { colors } from "./data";

const Id = ({ id, width, x, y }) => {
  let data = util.hexData(width, true, x, y);

  // Set size based on length of id
  let size = 14;
  if(id.length > 1) {
    size = 12;
  }
  if(id.length > 2) {
    size = 10;
  }

  // Label Text
  return (
    <text
      fontFamily="Helvetica, Arial, sans-serif"
      fill={colors["text"]}
      stroke="none"
      strokeLinecap="round"
      strokeLinejoin="bevel"
      alignmentBaseline="middle"
      textAnchor="middle"
      fontSize={size}
      x={util.linear(0.14, data.middle, data.points[4])[0]}
      y={util.linear(0.14, data.middle, data.points[4])[1]}
    >
      {id}
    </text>
  );
};

export default Id;
