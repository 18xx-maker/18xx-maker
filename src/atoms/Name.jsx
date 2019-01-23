import React from "react";

const Name = ({ name, color, bgColor, path, rotation, reverse, offset, y, textLength, fontSize }) => {
  let fillColor = color || "black";
  fontSize = fontSize || 11;

  let nameNode = path ? (
    <textPath startOffset={`${offset || 50}%`}
              href={`#${path}`}
              xlinkHref={`#${path}`}>
      {name}
    </textPath>
  ) : name;

  y = y || 0;

  if(!path && reverse) {
    y += (0.75 * fontSize);
  }

  return (
    <text
      dy={y}
      transform={`rotate(${(rotation || 0) + 360})`}
      fill={fillColor}
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize={fontSize || 11}
      fontWeight="bold"
      textLength={textLength}
      textAnchor="middle"
    >
      {nameNode}
    </text>
  );
};

export default Name;
