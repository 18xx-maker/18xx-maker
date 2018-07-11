import React from "react";
import { colors } from "../data";

const Label = ({ label, size, length }) => {
  let fontSize = label.length > 2 ? 20 : 30;
  if (label.length > 8) {
    fontSize = 18;
  }
  if (label.length > 12) {
    fontSize = 16;
  }
  if (label.length > 16) {
    fontSize = 12;
  }

  if(size !== undefined) {
    fontSize = size;
  }

  return (
    <text
      fill={colors["track"]}
      fontFamily="Bitter"
      fontWeight="bold"
      fontSize={fontSize}
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
