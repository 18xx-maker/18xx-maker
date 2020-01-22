import React from "react";
import Color from "./data/Color";

import SvgIcon from "./SvgIcon";

const Legend = ({ color, icon, description, right }) => {
  return (
    <Color context="companies">
      {(c,t) => (
        <g>
          <circle r="15" cx={right ? -15 : 15} cy="0"
                  stroke="none"
                  fill={c(color || "orange")}
          />
          <SvgIcon name={icon || "info"}
                   style={{fill: t(c(color || "orange"))}}
                   x={right ? -30 : 0}
                   y={-15}
          />
          <text
            fontFamily="sans-serif"
            fontSize="14"
            fontWeight="normal"
            textAnchor={right ? "end" : "start"}
            dominantBaseline="middle"
            fill="black"
            stroke="black"
            x={right ? -34 : 34}
            y="1"
          >
            {description}
          </text>
        </g>
      )}
    </Color>
  );
};

export default Legend;
