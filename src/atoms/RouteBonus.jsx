import React from "react";

import Color from "../data/Color";

const RouteBonus = ({ value, size }) => {
  size = size || 14;
  let width = 5.0 * value.length;
  let height = size + 6;

  return (
    <Color>
      {(c,t,s,p) => (
        <g>
          <polygon
            points={`${-width - 10},0 ${-width},${height*0.5} ${width},${height*0.5} ${width+10},0 ${width},${height*-0.5} ${-width},${height*-0.5}`}
            fill={p("white")}
            stroke={p("black")}
            strokeWidth="1"
          />
          <text
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
  );
};

export default RouteBonus;
