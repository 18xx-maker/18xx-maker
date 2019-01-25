import React from "react";
import Color from "../data/Color";

import RotateContext from "../context/RotateContext";

const Value = ({ value, fixed }) => {
  let size = 15;
  if (value > 99) {
    size = 13;
  }

  return (
    <RotateContext.Consumer>
      {rotation => (
        <Color>
          {c => (
            <g>
              <circle
                fill={c("white")}
                stroke={c("black")}
                strokeWidth="2"
                cx="0"
                cy="0"
                r="15"
              />
              <text
                transform={fixed ? null : `rotate(-${rotation})`}
                fontWeight="bold"
                fontSize={size}
                fontFamily="Helvetica, Arial, sans-serif"
                fill={c("black")}
                dominantBaseline="central"
                textAnchor="middle"
                x="0"
                y="0"
              >
                {value}
              </text>
            </g>
          )}
        </Color>
      )}
    </RotateContext.Consumer>
  );
};

export default Value;
