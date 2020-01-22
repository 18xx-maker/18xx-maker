import React from "react";

import Color from "../data/Color";
import Config from "../data/Config";
import Cell from "./Cell";
import Ledges from "./Ledges";

import Legend from "../Legend";

import addIndex from "ramda/src/addIndex";
import chain from "ramda/src/chain";
import concat from "ramda/src/concat";
import map from "ramda/src/map";
import reverse from "ramda/src/reverse";

const findBottomRightMost = market => {
  let bottomRightMost = 0;
  let maxLength = 0;

  for(let i = 0; i < market.length; i++) {
    let row = market[i];

    if (row.length >= maxLength) {
      maxLength = row.length;
      bottomRightMost = i;
    }
  }

  return bottomRightMost;
}

const findRightBottomMost = market => {
  return market[market.length - 1].length - 1;
}

const Market = ({data, title}) => {
  let cells = [];
  let market = [];
  let bottomMarket = [];

  switch (data.type) {
  case "1D":
    bottomMarket = map(cell => cell && cell.bottom ? cell : null, data.market || []);
    market = map(cell => cell && cell.bottom ? null : cell, data.market || []);
    cells = addIndex(map)((cell, i) => (
      <g key={`cell-bottom-${i}`}
         transform={`translate(${i * data.width} 50)`}>
        <Cell cell={cell} data={data} />
      </g>
    ), bottomMarket);
    cells = concat(cells, addIndex(map)((cell, i) => (
      <g key={`cell-top-${i}`}
         transform={`translate(${i * data.width} 50)`}>
        <Cell cell={cell} data={data} />
      </g>
    ), market));
    break;
  case "1Diag":
    bottomMarket = map(cell => cell && cell.bottom ? cell : null, data.market || []);
    market = map(cell => cell && cell.bottom ? null : cell, data.market || []);
    cells = addIndex(map)((cell, i) => (
      <g key={`cell-bottom-${i}`}
         transform={`translate(${i * 0.5 * data.width} ${i % 2 === 0 ? 50 : 50 + data.height})`}>
        <Cell cell={cell} data={data} />
      </g>
    ), bottomMarket);
    cells = concat(cells, addIndex(map)((cell, i) => (
      <g key={`cell-top-${i}`}
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
        <g key={`cell-bottom-${x}-${y}`}
           transform={`translate(${x * data.width} ${y * data.height + 50})`}>
          <Cell cell={cell} data={data} />
        </g>
      ), row);
    }, bottomMarket);
    cells = concat(cells, addIndex(chain)((row, y) => {
      return addIndex(map)((cell, x) => (
        <g key={`cell-top-${x}-${y}`}
           transform={`translate(${x * data.width} ${y * data.height + 50})`}>
          <Cell cell={cell} data={data} />
        </g>
      ), row);
    }, market));
    break;
  };

  let legend = null;

  if (data.type === "2D") {
    let bottomRightMost = findBottomRightMost(data.market);
    let rightBottomMost = findRightBottomMost(data.market);

    let left = (rightBottomMost + 1) * data.width + 5;
    let top = (bottomRightMost + 1) * data.height + 55;
    let right = data.totalWidth;
    let bottom = data.totalHeight;

    legend = (
      <Config>
        {(config, game) => {
          let legend = reverse((game.stock && game.stock.legend) || []);

          return (
            <Color context="companies">
              {c => (
                <g>
                  <path
                    d={`M ${left} ${bottom} L ${right} ${bottom} L ${right} ${top}`}
                    stroke={c("black")}
                    strokeWidth="1"
                    fill="none"
                  />
                  {addIndex(map)((legend, i) => (
                    <g
                      key={`pool-note-${i}`}
                      transform={`translate(${right - 5} ${bottom - (i * 35) - 20})`}
                    >
                      <Legend right={true} {...legend}/>
                    </g>
                  ), legend)}
                </g>
              )}
            </Color>
          );
        }}
      </Config>
    );
  } else if (data.type === "1D") {
    legend = (
      <Config>
        {(config, game) => {
          let legend = (game.stock && game.stock.legend) || [];
          let left = 0;

          return (
            <g>
              {addIndex(map)((legend, i) => {
                let current = left;
                left += 40 + legend.description.length * 8;
                return (
                  <g
                    key={`pool-note-${i}`}
                    transform={`translate(${current} ${1 * data.height + 75})`}
                  >
                    <Legend {...legend}/>
                  </g>
                );
              }, legend)}
            </g>
          );
        }}
      </Config>
    );
  } else if (data.type === "1Diag") {
    legend = (
      <Config>
        {(config, game) => {
          let legend = (game.stock && game.stock.legend) || [];
          let left = 0;

          return (
            <g>
              {addIndex(map)((legend, i) => {
                let current = left;
                left += 40 + legend.description.length * 8;
                return (
                  <g
                    key={`pool-note-${i}`}
                    transform={`translate(${current} ${2 * data.height + 75})`}
                  >
                    <Legend {...legend}/>
                  </g>
                );
              }, legend)}
            </g>
          );
        }}
      </Config>
    );
  }

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
      {legend}
      {cells}
      <Ledges data={data} />
    </g>
  );
};

export default Market;
