import React from "react";
import { Redirect, useParams } from "react-router-dom";

import Cell from "./Cell";
import Config from "../data/Config";
import Ledges from "./Ledges";
import Svg from "../Svg";

import { getMarketData } from "./util";

import addIndex from "ramda/src/addIndex";
import chain from "ramda/src/chain";
import map from "ramda/src/map";

const Market = () => {
  let params = useParams();
  return (
    <Config>
      {(config, game) => {

        if (!game.stock || !game.stock.market) {
          return <Redirect to={`/${params.game}/background`} />;
        }

        let data = getMarketData(game.stock, config.stock, config.paper);

        let cells = [];
        switch (data.type) {
        case "1D":
          cells = addIndex(map)((cell, i) => (
            <g key={`cell-${i}`}
               transform={`translate(${i * data.width} 0)`}>
              <Cell cell={cell} data={data} />
            </g>
          ), game.stock.market || []);
          break;
        case "1Diag":
          cells = addIndex(map)((cell, i) => (
            <g key={`cell-${i}`}
               transform={`translate(${i * 0.5 * data.width} ${i % 2 == 0 ? 0 : data.height})`}>
              <Cell cell={cell} data={data} />
            </g>
          ), game.stock.market || []);
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
          }, game.stock.market || []);
          break;
        };

        return (
          <React.Fragment>
            <div className="PrintNotes">
              <div>
                <h3>Width: {data.humanWidth}</h3>
                <h3>Height: {data.humanHeight}</h3>
              </div>
            </div>
            <div className="stock">
              <Svg
                width={data.css.totalWidth}
                height={data.css.totalHeight}
                viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}>
                <text
                  fontFamily="display"
                  fontStyle="bold"
                  fontSize="25"
                  dominantBaseline="hanging"
                  x="0"
                  y="12.5"
                >
                  {game.info.title} Stock Market
                </text>
                {cells}
                <Ledges data={data} />
              </Svg>
            </div>
          </React.Fragment>
        );
      }}
    </Config>
  );
};

export default Market;
