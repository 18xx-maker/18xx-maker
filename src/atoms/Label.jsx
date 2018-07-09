import React from "react";
import { colors } from "../data";

const Label = ({ label, length }) => {
  let size = label.length > 2 ? 20 : 30;
  if (label.length > 8) {
    size = 18;
  }
  if (label.length > 12) {
    size = 16;
  }
  if (label.length > 16) {
    size = 12;
  }

  return (
    <text
      fill={colors["track"]}
      fontFamily="Bitter"
      fontWeight="bold"
      fontSize={size}
      alignmentBaseline="central"
      textAnchor="middle"
      textLength={length}
      lengthAdjust="spacingAndGlyphs"
      x="0"
      y="0"
    >
      {label}
    </text>
  );
};

export default Label;
