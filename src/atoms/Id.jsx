import React from "react";
import { colors } from "../data";

import HexContext from "../context/HexContext";

const Id = ({ id, width, x, y }) => {
  return (
    <HexContext.Consumer>
      {hx => (
        <g transform={`rotate(${hx.rotation}) translate(-40 70)`}>
          <text
            fontFamily="Helvetica, Arial, sans-serif"
            fill={colors["text"]}
            stroke="none"
            strokeLinecap="round"
            strokeLinejoin="bevel"
            alignmentBaseline="baseline"
            textAnchor="start"
            fontSize="12"
            x="0"
            y="0"
          >
            {id}
          </text>
        </g>
      )}
    </HexContext.Consumer>
  );
};

export default Id;
