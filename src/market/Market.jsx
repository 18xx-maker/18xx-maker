import React from "react";

import Cell from "./Cell";
import Ledges from "./Ledges";

import addIndex from "ramda/src/addIndex";
import chain from "ramda/src/chain";
import map from "ramda/src/map";

const Market = ({data, title}) => {
  let cells = [];
  switch (data.type) {
  case "1D":
    cells = addIndex(map)((cell, i) => (
      <g key={`cell-${i}`}
         transform={`translate(${i * data.width} 50)`}>
        <Cell cell={cell} data={data} />
      </g>
    ), data.market || []);
    break;
  case "1Diag":
    cells = addIndex(map)((cell, i) => (
      <g key={`cell-${i}`}
         transform={`translate(${i * 0.5 * data.width} ${i % 2 === 0 ? 50 : 50 + data.height})`}>
        <Cell cell={cell} data={data} />
      </g>
    ), data.market || []);
    break;
  default:
    // 2D
    cells = addIndex(chain)((row, y) => {
      return addIndex(map)((cell, x) => (
        <g key={`cell-${x}-${y}`}
           transform={`translate(${x * data.width} ${y * data.height + 50})`}>
          <Cell cell={cell} data={data} />
        </g>
      ), row);
    }, data.market || []);
    break;
  };

  return (
    <g>
      <text
        fontFamily="display"
        fontStyle="bold"
        fontSize="25"
        dominantBaseline="hanging"
        x="0"
        y="12.5"
      >
        {title} Stock Market
      </text>
      {cells}
      <Ledges data={data} />
    </g>
  );
};

export default Market;
