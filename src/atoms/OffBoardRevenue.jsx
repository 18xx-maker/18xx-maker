import React from "react";
import * as R from "ramda";

import Name from "./Name";

import Color from "../data/Color";

const splitRevenues = (rows, revenues) => {
  if(!rows || rows < 2 || revenues.length < 2) {
    return [revenues];
  } else {
    return R.splitEvery(Math.ceil(revenues.length / rows), revenues);
  }
};

const LETTER = 10;

const makeNode = (x, y, reverse, revenue) => {
  let length = LETTER * revenue.cost.length;
  let phaseLength = LETTER * `${revenue.phase}`.length;
  let width = R.max(revenue.cost.length, 2) * LETTER + 5;

  let nodes = [
    <Color context="map">
      {c => (
        <rect
          width={width}
          height="20"
          x={x}
          y={y - 10}
          stroke="none"
          fill={c(revenue.color)}
          key={`rect-${revenue.cost}`}
        />
      )}
    </Color>,
    <Color context="map">
      {c => (
        <text
          fill={c(revenue.textColor) || c("black")}
          fontSize="14"
          alignmentBaseline="central"
          textAnchor="middle"
          textLength={length}
          lengthAdjust="spacingAndGlyphs"
          x={x + 0.5 * width}
          y={y - 1}
          key={`text-${revenue.cost}`}
        >
          {revenue.cost}
        </text>
      )}
    </Color>
  ];

  if(revenue.phase) {
    nodes.push([
      <Color context="map">
        {c => (
          <text
            fill={c(revenue.phaseColor) || c("white")}
            fontSize="14"
            alignmentBaseline="central"
            textAnchor="middle"
            textLength={phaseLength}
            lengthAdjust="spacingAndGlyphs"
            x={x + 0.5 * width}
            y={y + (reverse ? -20 : 20)}
            key={`phase-${revenue.phase}`}
          >
            {revenue.phase}
          </text>
        )}
      </Color>
    ]);
  };

  return nodes;
};

const getWidth = r => R.max(r.cost.length, 2) * LETTER + 5;

const makeNodes = (y, reverse, revenues) => {
  let totalWidth = R.sum(R.map(r => 5 + LETTER * R.max(r.cost.length, 2),
                               revenues));
  let bx = -0.5 * totalWidth; // Starting x for border box
  let x = bx;

  return R.concat(R.map(r => {
    let result = makeNode(x, y, reverse, r);
    x = x + getWidth(r);
    return result;
  }, revenues),[
    <Color context="map">
      {c => (
        <rect key={`rect-border-${y}`}
              width={totalWidth}
              height="20"
              y={y - 10}
              x={bx}
              fill="none"
              strokeWidth="1"
              stroke={c("black")} />
      )}
    </Color>
  ]);
};

const OffBoardRevenue = ({ name, revenues, reverse, rows }) => {
  let nameNode = null;
  if (name) {
    nameNode = <Name {...name}
                     y={name.y || (reverse ? 16 : -16)}
                     reverse={reverse}
                     bgColor={name.bgColor || "offboard"} />;
  }

  let split = splitRevenues(rows, revenues);

  let nodes = R.addIndex(R.chain)((revenues, row) => {
    let y = row * 20 * (reverse ? -1 : 1);
    return makeNodes(y, reverse, revenues);
  }, split);
  // let nodes = makeNodes(-10, reverse, revenues);

  return (
    <g>
      {nodes}
      {nameNode}
    </g>
  );
};

export default OffBoardRevenue;
export { splitRevenues };
