import React from "react";
import { colors, textColor } from "../data";
import * as R from "ramda";

const OffBoardRevenue = ({ revenues }) => {
  let count = revenues.length;
  let width = 25;
  let totalWidth = count * width;
  let bx = -0.5 * totalWidth;

  let nodes = R.addIndex(R.map)((revenue, index) => {
    let x = index * width - 0.5 * totalWidth + 0.5 * width;
    let rx = index * width - 0.5 * totalWidth;
    return [
      <rect
        width="25"
        height="20"
        x={rx}
        y="-10"
        stroke="none"
        fill={colors[revenue.color]}
      />,
      <text
        fill={textColor(revenue.color)}
        fontSize="14"
        alignmentBaseline="central"
        textAnchor="middle"
        textLength={20}
        lengthAdjust="spacingAndGlyphs"
        x={x}
        y="-1"
      >
        {revenue.cost}
      </text>
    ];
  }, revenues);

  return (
    <g>
      {nodes}
      <rect
        width={totalWidth}
        height="20"
        y="-10"
        x={bx}
        fill="none"
        stroke={colors["black"]}
      />
    </g>
  );
};

export default OffBoardRevenue;
