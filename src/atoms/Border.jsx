import React from "react";
import { colors } from "../data";

import HexContext from "../context/HexContext";

const edge = 150 * 0.57735;

const Border = ({ color }) => {
  return (
    <HexContext.Consumer>
      {hx => (
        <path
          d={`m ${0.5 * edge} 75 L ${-0.5 * edge} 75`}
          fill="none"
          stroke={colors[color]}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`rotate(${hx.rotation})`}
        />
      )}
    </HexContext.Consumer>
  );
};

export default Border;
