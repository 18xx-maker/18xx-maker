import React from "react";

import Color from "../data/Color";

import Cell from "./Cell";
import Ledges from "./Ledges";
import Par from "./Par";
import MarketRoundTracker from "./MarketRoundTracker";

import Legend from "../Legend";

import { getParData } from "./util";

import addIndex from "ramda/src/addIndex";
import chain from "ramda/src/chain";
import concat from "ramda/src/concat";
import map from "ramda/src/map";
import reverse from "ramda/src/reverse";

const Market = ({data, game, config, title}) => {
  let cells = [];
  let market = [];
  let bottomMarket = [];

  const pass = {game, config, data};

  switch (data.type) {
  case "1D":
    bottomMarket = map(cell => cell && cell.bottom ? cell : null, data.market || []);
    market = map(cell => cell && cell.bottom ? null : cell, data.market || []);
    cells = addIndex(map)((cell, i) => (
      <g key={`cell-bottom-${i}`}
         transform={`translate(${i * data.width} ${(data.stock.title === false ? 0 : 50)})`}>
        <Cell cell={cell} {...pass} />
      </g>
    ), bottomMarket);
    cells = concat(cells, addIndex(map)((cell, i) => (
      <g key={`cell-top-${i}`}
         transform={`translate(${i * data.width} ${(data.stock.title === false ? 0 : 50)})`}>
        <Cell cell={cell} {...pass} />
      </g>
    ), market));
    break;
  case "1Diag":
    bottomMarket = map(cell => cell && cell.bottom ? cell : null, data.market || []);
    market = map(cell => cell && cell.bottom ? null : cell, data.market || []);
    cells = addIndex(map)((cell, i) => (
      <g key={`cell-bottom-${i}`}
         transform={`translate(${i * 0.5 * data.width} ${i % 2 === 0 ? (data.stock.title === false ? 0 : 50) : (data.stock.title === false ? 0 : 50) + data.height})`}>
        <Cell cell={cell} {...pass} />
      </g>
    ), bottomMarket);
    cells = concat(cells, addIndex(map)((cell, i) => (
      <g key={`cell-top-${i}`}
         transform={`translate(${i * 0.5 * data.width} ${i % 2 === 0 ? (data.stock.title === false ? 0 : 50) : (data.stock.title === false ? 0 : 50) + data.height})`}>
        <Cell cell={cell} {...pass} />
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
           transform={`translate(${x * data.width} ${y * data.height + (data.stock.title === false ? 0 : 50)})`}>
          <Cell cell={cell} {...pass} />
        </g>
      ), row);
    }, bottomMarket);
    cells = concat(cells, addIndex(chain)((row, y) => {
      return addIndex(map)((cell, x) => (
        <g key={`cell-top-${x}-${y}`}
           transform={`translate(${x * data.width} ${y * data.height + (data.stock.title === false ? 0 : 50)})`}>
          <Cell cell={cell} {...pass} />
        </g>
      ), row);
    }, market));
    break;
  };

  let roundTracker = null;
  if (data.display.roundTracker) {
    roundTracker = <MarketRoundTracker roundTracker={data.display.roundTracker}
                                       game={game}
                                       config={config} />;
  }

  let par = null;
  if (data.config.stock.display.par && data.display.par) {
    // We want to display par chart on the market
    let x = data.display.par.x * data.config.stock.cell.width;
    let y = data.display.par.y * data.config.stock.cell.height;
    par = (
      <g transform={`translate(${x} ${y + (data.stock.title === false ? 0 : 50)})`}>
        <Par title="Par" data={getParData(data.stock, data.config)} />
      </g>
    );
  }

  let legend = null;

  if (data.type === "2D") {
    if (!config.stock.display.legend ||
        !game.stock.display ||
        !game.stock.display.legend) {
      return null;
    }

    let legend = (game.stock && game.stock.legend) || [];
    if (game.stock.display.legend.reverse) {
      legend = reverse(legend);
    }
    let x = game.stock.display.legend.x * config.stock.cell.width;
    let y = game.stock.display.legend.y * config.stock.cell.height;

    legend = (
      <Color context="companies">
        {c => (
          <g>
            {addIndex(map)((legend, i) => (
              <g
                key={`pool-note-${i}`}
                transform={`translate(${x} ${y + (data.stock.title === false ? 0 : 50) + (i * (game.stock.display.legend.verticalAlign === "bottom" ? -35 : 35))})`}
              >
                <Legend right={game.stock.display.legend.align === "right"}
                        bottom={game.stock.display.legend.verticalAlign === "bottom"}
                        reverse={game.stock.display.legend.reverse}
                        {...legend}/>
              </g>
            ), legend)}
          </g>
        )}
      </Color>
    );
  } else if (data.type === "1D") {
    if (!config.stock.display.legend) {
      return null;
    }

    let legend = (game.stock && game.stock.legend) || [];
    let left = 0;

    legend = (
      <g>
        {addIndex(map)((legend, i) => {
          let current = left;
          left += 100 + legend.description.length * 6.5;
          return (
            <g
              key={`pool-note-${i}`}
              transform={`translate(${current} ${1 * data.height + (data.stock.title === false ? 25 : 75)})`}
            >
              <Legend {...legend}/>
            </g>
          );
        }, legend)}
      </g>
    );
  } else if (data.type === "1Diag") {
    if (!config.stock.display.legend) {
      return null;
    }

    let legend = (game.stock && game.stock.legend) || [];
    let left = 0;

    legend = (
      <g>
        {addIndex(map)((legend, i) => {
          let current = left;
          left += 100 + legend.description.length * 6.5;
          return (
            <g
              key={`pool-note-${i}`}
              transform={`translate(${current} ${2 * data.height + (data.stock.title === false ? 25 : 75)})`}
            >
              <Legend {...legend}/>
            </g>
          );
        }, legend)}
      </g>
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
      {roundTracker}
      {cells}
      {par}
      {legend}
      <Ledges data={data} />
    </g>
  );
};

export default Market;
