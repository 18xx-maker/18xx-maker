import React from "react";
import Color from "../data/Color";
import * as uuid from "uuid";

const Name = ({ name, strokeColor, strokeWidth, color, bgColor, path, pathDef, doRotation, rotation, reverse, offset, x, y, textLength, fontFamily, fontSize, fontStyle, fontWeight }) => {
  fontSize = fontSize || 11;
  let nameNode;

  if (pathDef) {
    let id = uuid.v4();
    nameNode =  (
      <React.Fragment>
      <defs>
        <path id={id}  d={pathDef} />
      </defs>
      <textPath
        startOffset={`${offset || 50}%`}
        href={`#${id}`}
        xlinkHref={`#${id}`}
      >
      {name}
      </textPath>
      </React.Fragment>
    );
//    nameNode =  (
//      <textPath
//        startOffset={`${offset || 50}%`}
//        path={pathDef}>
//        {name}
//      </textPath>
//    );
  } else if (path) {
    nameNode =  (
      <textPath
        startOffset={`${offset || 50}%`}
        href={`#${path}`}
        xlinkHref={`#${path}`}>
        {name}
      </textPath>
    );
  } else {
    nameNode = name;
  }

  y = y || 0;

  if((!path || !pathDef) && reverse) {
    y += (0.75 * fontSize);
  }

  return (
    <Color>
      {(c,t,s,p) => (
        <text
          dx={x}
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
