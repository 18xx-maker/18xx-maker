import React from "react";
import Color from "../data/Color";

const Value = ({ value }) => {
  let size = 15;
  if (value > 99) {
    size = 13;
  }

  return (
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
            fontWeight="bold"
            fontSize={size}
            fontFamily="Helvetica, Arial, sans-serif"
            fill={c("black")}
            alignmentBaseline="central"
            textAnchor="middle"
            x="0"
            y="0"
          >
            {value}
          </text>
        </g>
      )}
    </Color>
  );
};

export default Value;
