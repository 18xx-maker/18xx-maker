import React from "react";
import Color from "../data/Color";

const Name = ({ name, strokeColor, strokeWidth, color, bgColor, path, doRotation, rotation, reverse, offset, y, textLength, fontFamily, fontSize, fontStyle, fontWeight }) => {
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
    <Color>
      {(c,t,s,p) => (
        <text
          dy={y}
          transform={`rotate(${((doRotation && rotation) || 0) + 360})`}
          fill={color ? p(color) : (bgColor ? t(c(bgColor)) : p("black"))}
          strokeWidth={strokeWidth || 0}
          stroke={c(strokeColor || "black")}
          fontFamily={fontFamily || "sans-serif"}
          fontSize={fontSize || 11}
          fontStyle={fontStyle || "regular"}
          fontWeight={fontWeight || "bold"}
          textLength={textLength}
          textAnchor="middle"
        >
          {nameNode}
        </text>
      )}
    </Color>
  );
};

export default Name;
