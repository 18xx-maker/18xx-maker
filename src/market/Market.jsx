import React from "react";

import Cell from "./Cell";
import Ledges from "./Ledges";

import addIndex from "ramda/src/addIndex";
import chain from "ramda/src/chain";
import concat from "ramda/src/concat";
import map from "ramda/src/map";

const Market = ({data, title}) => {
  let cells = [];
  let market = [];
  let bottomMarket = [];

  switch (data.type) {
  case "1D":
    bottomMarket = map(cell => cell && cell.bottom ? cell : null, data.market || []);
    market = map(cell => cell && cell.bottom ? null : cell, data.market || []);
    cells = addIndex(map)((cell, i) => (
      <g key={`cell-${i}`}
         transform={`translate(${i * data.width} 50)`}>
        <Cell cell={cell} data={data} />
      </g>
    ), bottomMarket);
    cells = concat(cells, addIndex(map)((cell, i) => (
      <g key={`cell-${i}`}
         transform={`translate(${i * data.width} 50)`}>
        <Cell cell={cell} data={data} />
      </g>
    ), market));
    break;
  case "1Diag":
    bottomMarket = map(cell => cell && cell.bottom ? cell : null, data.market || []);
    market = map(cell => cell && cell.bottom ? null : cell, data.market || []);
    cells = addIndex(map)((cell, i) => (
      <g key={`cell-${i}`}
         transform={`translate(${i * 0.5 * data.width} ${i % 2 === 0 ? 50 : 50 + data.height})`}>
        <Cell cell={cell} data={data} />
      </g>
    ), bottomMarket);
    cells = concat(cells, addIndex(map)((cell, i) => (
      <g key={`cell-${i}`}
         transform={`translate(${i * 0.5 * data.width} ${i % 2 === 0 ? 50 : 50 + data.height})`}>
        <Cell cell={cell} data={data} />
      </g>
    ), market));
    break;
  default:
    bottomMarket = map(row => map(cell => cell && cell.bottom ? cell : null, row), data.market || []);
    market = map(row => map(cell => cell && cell.bottom ? null : cell, row), data.market || []);
    // 2D
    cells = addIndex(chain)((row, y) => {
      return addIndex(map)((cell, x) => (
        <g key={`cell-${x}-${y}`}
           transform={`translate(${x * data.width} ${y * data.height + 50})`}>
          <Cell cell={cell} data={data} />
        </g>
      ), row);
    }, bottomMarket);
    cells = concat(cells, addIndex(chain)((row, y) => {
      return addIndex(map)((cell, x) => (
        <g key={`cell-${x}-${y}`}
           transform={`translate(${x * data.width} ${y * data.height + 50})`}>
          <Cell cell={cell} data={data} />
        </g>
      ), row);
    }, market));
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
