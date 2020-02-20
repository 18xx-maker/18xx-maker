import React from "react";
import Color from "../data/Color";

import HexContext from "../context/HexContext";

const edge = 150 * 0.57735;

const Border = ({ color, dashed, offset }) => {
  let strokeDashArray = "none";
  let strokeDashOffset = "-3";
  let width = 16;
  if (dashed) {
    strokeDashArray = `${width}`;
    if (offset) {
      strokeDashOffset = `${offset}`;
    }
  }
  return (
    <HexContext.Consumer>
      {hx => (
        <Color context="companies">
          {c => (
            <path
              d={`m ${0.5 * edge} 75 L ${-0.5 * edge} 75`}
              fill="none"
              stroke={c(color)}
              strokeWidth="10"
              strokeDasharray={strokeDashArray}
              strokeDashoffset={strokeDashOffset}
              strokeLinecap="round"
              strokeLinejoin="round"
              transform={`rotate(${hx.rotation})`}
            />
          )}
        </Color>
      )}
    </HexContext.Consumer>
  );
};

export default Border;
