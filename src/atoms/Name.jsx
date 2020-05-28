import React from "react";
import Color from "../data/Color";

import { getFontProps  } from "../util";

import defaultTo from "ramda/src/defaultTo";

const Name = (props) => {
  let { name, strokeColor, strokeWidth, color, bgColor, path, doRotation, rotation, reverse, offset, y, textLength } = props;

  let font = getFontProps(props, 11, "bold", "sans-serif");

  let nameNode = path ? (
    <textPath startOffset={`${defaultTo(50, offset)}%`}
              href={`#${path}`}
              xlinkHref={`#${path}`}>
      {name}
    </textPath>
  ) : name;

  y = defaultTo(0, y);

  if(!path && reverse) {
    y += (0.75 * font.fontSize);
  }

  return (
    <Color>
      {(c,t,s,p) => (
        <text dy={y}
              transform={`rotate(${((doRotation && rotation) || 0) + 360})`}
              fill={color ? p(color) : (bgColor ? t(c(bgColor)) : p("black"))}
              strokeWidth={defaultTo(0, strokeWidth)}
              stroke={c(defaultTo("black", strokeColor))}
              {...font}
              textLength={textLength}
              textAnchor="middle" >
          {nameNode}
        </text>
      )}
    </Color>
  );
};

export default Name;
