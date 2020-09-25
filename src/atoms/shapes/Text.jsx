import React, { useContext } from "react";

import Color from "../../util/Color";
import RotateContext from "../../context/RotateContext";
import GameContext from "../../context/GameContext";

import { getFontProps } from "../../util";

import defaultTo from "ramda/src/defaultTo";

const Text = (props) => {
  const { game } = useContext(GameContext);
  let { text, fontFamily, color, rotation, fixed } = props;
  fontFamily = defaultTo(game.info.valueFontFamily, fontFamily);
  let font = getFontProps(props, null, null, fontFamily);

  return (
    <RotateContext.Consumer>
      {rotateContext => (

    <Color context="map">
      {c => (
        <text
              transform={(fixed || rotateContext.fixed) ? null : `rotate(${-rotateContext.angle - (rotation || 0)})`}
              fill={c(defaultTo("black", color))}
              {...font}
              dominantBaseline="central"
              textAnchor="middle">
          {text}
        </text>
      )}
    </Color>
      )}
    </RotateContext.Consumer>
  );
};

export default Text;
