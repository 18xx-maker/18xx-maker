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

const DEFAULT_FONTSIZE = 14;

const letter = (size) => {
  return size * (5/7.0);
};

const height = (size) => {
  return size + 6;
}

const makeNode = (x, y, reverse, revenue, size) => {
  let length = letter(size) * revenue.cost.length;
  let phaseLength = letter(size) * `${revenue.phase}`.length;
  let width = R.max(revenue.cost.length, 2) * letter(size) + 5;

  let nodes = [
    <Color context="map"
           key={`rect-${revenue.cost}`}>
      {c => (
        <rect
          width={width}
          height={height(size)}
          x={x}
          y={y - 10}
          stroke="none"
          fill={c(revenue.color)}
        />
      )}
    </Color>,
    <Color context="map"
           key={`text-${revenue.cost}`}>
      {c => (
        <text
          fill={c(revenue.textColor) || c("black")}
          fontSize={size}
          dominantBaseline="central"
          textAnchor="middle"
          textLength={length}
          lengthAdjust="spacingAndGlyphs"
          x={x + 0.5 * width}
          y={y - 10 + (size / 2) + 2}
        >
          {revenue.cost}
        </text>
      )}
    </Color>
  ];

  if(revenue.phase) {
    nodes.push([
      <Color key={`phase-${revenue.phase}`}
             context="map">
        {c => (
          <text
            fill={c(revenue.phaseColor) || c("white")}
            fontSize={size}
            dominantBaseline="central"
            textAnchor="middle"
            textLength={phaseLength}
            lengthAdjust="spacingAndGlyphs"
            x={x + 0.5 * width}
            y={y + (reverse ? -20 : 20)}
          >
            {revenue.phase}
          </text>
        )}
      </Color>
    ]);
  };

  return nodes;
};

const getWidth = (r, size) => R.max(r.cost.length, 2) * letter(size) + 5;

const makeNodes = (y, reverse, revenues, size) => {
  let totalWidth = R.sum(R.map(r => 5 + letter(size) * R.max(r.cost.length, 2),
                               revenues));
  let bx = -0.5 * totalWidth; // Starting x for border box
  let x = bx;

  return R.concat(R.map(r => {
    let result = makeNode(x, y, reverse, r, size);
    x = x + getWidth(r, size);
    return result;
  }, revenues),[
    <Color key={`rect-border-${y}`} context="map">
      {c => (
        <rect width={totalWidth}
              height={height(size)}
              y={y - 10}
              x={bx}
              fill="none"
              strokeWidth="1"
              stroke={c("black")} />
      )}
    </Color>
  ]);
};

const OffBoardRevenue = ({ name, revenues, reverse, rows, size}) => {
  let nameNode = null;
  if (name) {
    nameNode = <Name {...name}
                               y={name.y || (reverse ? 16 : -16)}
                               reverse={reverse}
                               bgColor={name.bgColor || "offboard"} />;
  }

  let split = splitRevenues(rows, revenues);

  let fontSize = DEFAULT_FONTSIZE;
	if (size !== undefined) {
  		fontSize = size;
	}

  let nodes = R.addIndex(R.chain)((revenues, row) => {
    let y = row * height(fontSize) * (reverse ? -1 : 1);
    return makeNodes(y, reverse, revenues, fontSize);
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
