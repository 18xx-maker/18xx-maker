import React from "react";
import { colors } from "../data";

const Id = ({ id, width, x, y }) => {
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
      x="0"
      y="0"
    >
      {id}
    </text>
  );
};

export default Id;
