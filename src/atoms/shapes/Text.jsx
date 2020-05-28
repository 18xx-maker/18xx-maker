import React from "react";

import Color from "../../data/Color";

import { getFontProps } from "../../util";

import defaultTo from "ramda/src/defaultTo";

const Text = (props) => {
  let { text, color } = props;
  let font = getFontProps(props);

  return (
    <Color context="map">
      {c => (
        <text fill={c(defaultTo("black", color))}
              {...font}
              dominantBaseline="central"
              textAnchor="middle">
          {text}
        </text>
      )}
    </Color>
  );
};

export default Text;
