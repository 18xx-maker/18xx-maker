import React from "react";

import { colors } from "../data";

const RouteBonus = ({ value }) => {
  let size = 15;
  let width = 5 * value.length;

  return (
    <g>
      <polygon
        points={`${-width - 10},0 ${-width},10 ${width},10 ${width+10},0 ${width},-10 ${-width},-10`}
        fill={colors["border"]}
        stroke={colors["track"]}
        strokeWidth="2"
      />
      <text
        fontWeight="bold"
        fontSize={size}
        fontFamily="Helvetica, Arial, sans-serif"
        fill={colors["track"]}
        alignmentBaseline="central"
        textAnchor="middle"
        x="0"
        y="0"
      >
        {value}
      </text>
    </g>
  );
};

export default RouteBonus;
