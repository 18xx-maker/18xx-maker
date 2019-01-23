import React from "react";

import Color from "../data/Color";

const RouteBonus = ({ value }) => {
  let size = 15;
  let width = 5 * value.length;

  return (
    <Color>
      {c => (
        <g>
          <polygon
            points={`${-width - 10},0 ${-width},10 ${width},10 ${width+10},0 ${width},-10 ${-width},-10`}
            fill={c("border")}
            stroke={c("track")}
            strokeWidth="2"
          />
          <text
            fontWeight="bold"
            fontSize={size}
            fontFamily="Helvetica, Arial, sans-serif"
            fill={c("track")}
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
