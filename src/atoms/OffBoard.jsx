import React from "react";
import { colors } from "../data";
import * as R from "ramda";

const OffBoard = ({ revenues }) => {
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
        y="-9"
        stroke="none"
        fill={colors[revenue.color]}
      />,
      <text
        fill={colors["black"]}
        fontSize="14"
        alignmentBaseline="central"
        textAnchor="middle"
        textLength={20}
        lengthAdjust="spacingAndGlyphs"
        x={x}
        y="0"
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
        y="-9"
        x={bx}
        fill="none"
        stroke={colors["black"]}
      />
    </g>
  );
};

export default OffBoard;
