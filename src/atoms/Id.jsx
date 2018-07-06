import React from "react";
import { colors } from "../data";

const Id = ({ id, width, x, y }) => {
  return (
    <text
      fontFamily="Helvetica, Arial, sans-serif"
      fill={colors["text"]}
      stroke="none"
      strokeLinecap="round"
      strokeLinejoin="bevel"
      alignmentBaseline="baseline"
      textAnchor="start"
      fontSize="12"
      x="0"
      y="0"
    >
      {id}
    </text>
  );
};

export default Id;
