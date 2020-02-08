import React from "react";
import Color from "./data/Color";

const Legend = ({ color, borderColor, borderWidth, description, right, bottom }) => {
  return (
    <Color>
      {(c,t) => (
        <g>
          <circle r="12" cx={right ? -20 : 20} cy={bottom ? -20 : 20}
                  stroke={c(borderColor || "black")}
                  strokeWidth={borderWidth || 2}
                  fill={c(color || "orange")}
          />
          <text
            fontFamily="sans-serif"
            fontSize="14"
            fontWeight="normal"
            textAnchor={right ? "end" : "start"}
            dominantBaseline="middle"
            fill="black"
            stroke="black"
            x={right ? -39 : 39}
            y={bottom ? -20 : 20}
          >
            {description}
          </text>
        </g>
      )}
    </Color>
  );
};

export default Legend;
