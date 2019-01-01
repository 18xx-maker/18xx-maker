import React from "react";
import { textColor } from "../data";

const Name = ({ name, color, bgColor, path, rotation, reverse, offset, y, textLength, fontSize }) => {
  let fillColor = color || textColor(bgColor || "white");

  let nameNode = path ? (
    <textPath transform="scale(1.8)" startOffset={`${offset || 50}%`} href={`#${path}`}>
      {name}
    </textPath>
  ) : name;

  return (
    <text
      dy={y || 0}
      transform={`rotate(${(rotation || 0) + 360})`}
      fill={fillColor}
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize={fontSize || 10}
      fontWeight="bold"
      textLength={textLength}
      alignmentBaseline={reverse ? "hanging" : "baseline"}
      textAnchor="middle"
    >
      {nameNode}
    </text>
  );
};

export default Name;
