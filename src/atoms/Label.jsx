import React from "react";
import { colors } from "../data";

const Label = ({ label }) => {
  let size = label.length > 2 ? 20 : 30;

  return (
    <text
      fill={colors["track"]}
      fontFamily="Bitter"
      fontWeight="bold"
      fontSize={size}
      alignmentBaseline="central"
      textAnchor="middle"
      x="0"
      y="0"
    >
      {label}
    </text>
  );
};

export default Label;
