import React, {useContext} from "react";
import GameContext from "../../context/GameContext";
import Text from "./Text";
import Color from "../../util/Color";

import { getFontProps, multiDefaultTo } from "../../util";

import defaultTo from "ramda/src/defaultTo";

const Circle = (props) => {
  let { text, textColor, fontFamily, color, opacity, borderColor, borderWidth, width, dashed } = props;
  const { game } = useContext(GameContext);

  let scale = defaultTo(50, width) / 50;
  let font = getFontProps(props, 16 * scale, undefined,
    multiDefaultTo(undefined, fontFamily, game.info.valueFontFamily));

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
          <Text {...font} text={text} fontFamily={fontFamily} color={textColor}/>
        </g>
      )}
    </Color>
  );
};

export default Circle;
