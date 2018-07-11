import React from "react";
import { colors, textColor } from "../data";
import * as R from "ramda";

const OffBoardRevenue = ({ revenues }) => {
  let totalWidth = R.sum(
    R.map(r => 5 + 10 * R.max(r.cost.length, 2), revenues)
  );
  let bx = -0.5 * totalWidth; // Starting x for border box

  let nodes = [];
  let currentX = bx;

  R.addIndex(R.map)((revenue, index) => {
    let length = 10 * revenue.cost.length;
    let width = R.max(revenue.cost.length, 2) * 10 + 5;
    nodes.push([
      <rect
        width={width}
        height="20"
        x={currentX}
        y="-10"
        stroke="none"
        fill={colors[revenue.color]}
      />,
      <text
        fill={colors[revenue.textColor] || colors["black"]}
        fontSize="14"
        alignmentBaseline="central"
        textAnchor="middle"
        textLength={length}
        lengthAdjust="spacingAndGlyphs"
        x={currentX + 0.5 * width}
        y="-1"
      >
        {revenue.cost}
      </text>
    ]);

    currentX = currentX + width;
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
