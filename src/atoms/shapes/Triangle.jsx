import React from "react";

import Text from "./Text";
import Color from "../../data/Color";

import { getFontProps  } from "../../util";

import defaultTo from "ramda/src/defaultTo";

const Triangle = (props) => {
  let { text, textColor, color, opacity, borderColor, borderWidth, width, dashed, reverse } = props;

  let scale = defaultTo(50, width) / 50;
  let x = 25 * scale;
  let y1 = 14.43375673 * scale * (reverse ? -1 : 1);
  let y2 = -28.86751346 * scale * (reverse ? -1 : 1);

  // These values are for a triangle inscribed IN a circle of r = width
  // let x = 21.6506351 * scale;
  // let y1 = 12.5 * scale * (reverse ? -1 : 1);
  // let y2 = -25 * scale * (reverse ? -1 : 1);

  let font = getFontProps(props, 14 * scale);
  let strokeDashArray = dashed ? `${width / 7.142857143} ${width / 7.142857143}` : undefined;

  return (
    <Color>
      {(c,t) => (
        <g>
          <path d={`M -${x} ${y1} L 0 ${y2} L ${x} ${y1} z`}
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

export default Triangle;
