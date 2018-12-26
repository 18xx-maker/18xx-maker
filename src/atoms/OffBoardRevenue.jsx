import React from "react";
import { colors } from "../data";
import * as R from "ramda";

import Name from "./Name";

const OffBoardRevenue = ({ name, revenues, reverse }) => {
  let letter = 10;
  let totalWidth = R.sum(
    R.map(r => 5 + letter * R.max(r.cost.length, 2), revenues)
  );
  let bx = -0.5 * totalWidth; // Starting x for border box

  let nodes = [];
  let currentX = bx;

  let nameNode = null;
  if (name) {
    nameNode = <Name {...name}
                     y={name.y || (reverse ? 16 : -16)}
                     reverse={reverse}
                     bgColor={name.bgColor || "offboard"} />;
  }

  R.addIndex(R.map)((revenue, index) => {
    let length = letter * revenue.cost.length;
    let phaseLength = letter * `${revenue.phase}`.length;
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

    if (revenue.phase) {
      nodes.push([
        <text
          fill={colors[revenue.phaseColor] || colors["white"]}
          fontSize="14"
          alignmentBaseline="central"
          textAnchor="middle"
          textLength={phaseLength}
          lengthAdjust="spacingAndGlyphs"
          x={currentX + 0.5 * width}
          y={reverse ? -21 : 21}
          key={`phase-${revenue.phase}`}
        >
          {revenue.phase}
        </text>
      ]);
    }

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
      {nameNode}
    </g>
  );
};

export default OffBoardRevenue;
