import React from "react";
import { colors } from "../data";

import HexContext from "../context/HexContext";

const edge = 150 * 0.57735;

const Border = ({ color, border }) => {
  let node;
  if (border) {
    return (
      <HexContext.Consumer>
        {hx => (
          <path
            d={`m ${0.5 * edge} 75 L ${-0.5 * edge} 75`}
            fill="none"
            stroke={colors["border"]}
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={`rotate(${hx.rotation})`}
          />
        )}
      </HexContext.Consumer>
    );
  } else {
    return (
      <HexContext.Consumer>
        {hx => (
          <path
            d={`m ${0.5 * edge} 75 L ${-0.5 * edge} 75`}
            fill="none"
            stroke={colors[color]}
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={`rotate(${hx.rotation})`}
          />
        )}
      </HexContext.Consumer>
    );
  }
};

export default Border;
