import React from "react";

import Color from "../data/Color";

const RouteBonus = ({ value }) => {
  let size = 15;
  let width = 5 * value.length;

  return (
    <Color>
      {(c,t,s,p) => (
        <g>
          <polygon
            points={`${-width - 10},0 ${-width},10 ${width},10 ${width+10},0 ${width},-10 ${-width},-10`}
            fill={p("white")}
            stroke={p("black")}
            strokeWidth="2"
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
