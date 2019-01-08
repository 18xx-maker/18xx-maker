import React from "react";

const Name = ({ name, color, bgColor, path, rotation, reverse, offset, y, textLength, fontSize }) => {
  let fillColor = color || "black";

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
      fontSize={fontSize || 11}
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
