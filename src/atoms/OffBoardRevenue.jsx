import React from "react";
import { colors } from "../data";
import * as R from "ramda";

const OffBoardRevenue = ({ revenues }) => {
  let letter = 8;
  let totalWidth = R.sum(
    R.map(r => 5 + letter * R.max(r.cost.length, 2), revenues)
  );
  let bx = -0.5 * totalWidth; // Starting x for border box

  let nodes = [];
  let currentX = bx;

  R.addIndex(R.map)((revenue, index) => {
    let length = letter * revenue.cost.length;
    let width = R.max(revenue.cost.length, 2) * letter + 5;
    nodes.push([
      <rect
        width={width}
        height="20"
        x={currentX}
        y="-10"
        stroke="none"
        fill={colors[revenue.color]}
        key={`rect-${revenue.cost}`}
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
        key={`text-${revenue.cost}`}
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
