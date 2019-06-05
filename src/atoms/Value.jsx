import React from "react";
import Color from "../data/Color";

import RotateContext from "../context/RotateContext";

const Value = ({ value, fixed, outerBorderColor }) => {
  let size = 15;
  if (value > 99) {
    size = 13;
  }

  return (
    <RotateContext.Consumer>
      {rotation => (
        <Color>
          {(c,t,s,p) => (
            <g>
              if(outerBorderColor) {
                <circle
                  stroke={p(outerBorderColor)}
                  strokeWidth="7"
                  cx="0"
                  cy="0"
                  r="14"
                />
              }
              <circle
                fill={p("white")}
                stroke={p("black")}
                strokeWidth="2"
                cx="0"
                cy="0"
                r="14"
              />
              <text
                transform={fixed ? null : `rotate(-${rotation})`}
                fontWeight="bold"
                fontSize={size}
                fontFamily="sans-serif"
                fill={p("black")}
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
