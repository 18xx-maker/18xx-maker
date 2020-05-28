import React from "react";

import Text from "./Text";
import Color from "../../data/Color";

import { getFontProps } from "../../util";

import defaultTo from "ramda/src/defaultTo";

const Circle = (props) => {
  let { text, textColor, color, opacity, borderColor, borderWidth, width, dashed } = props;

  let scale = defaultTo(50, width) / 50;
  let font = getFontProps(props, 16 * scale);

  let strokeDashArray = dashed ? `${width / 7.142857143} ${width / 7.142857143}` : undefined;
  let r = 25 * scale

  return (
    <Color>
      {(c,t) => (
        <g>
          <circle r={r}
                  fill={defaultTo("none", c(color))}
                  fillOpacity={defaultTo(1, opacity)}
                  stroke={c(defaultTo("black", borderColor))}
                  strokeWidth={defaultTo(2, borderWidth)}
                  strokeDasharray={strokeDashArray}
                  strokeLinecap="round" />
          <Text {...font} text={text} color={textColor} />
        </g>
      )}
    </Color>
  );
};

export default Circle;
