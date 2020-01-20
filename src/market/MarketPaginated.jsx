import React from "react";
import { Redirect, useParams } from "react-router-dom";

import Cell from "./Cell";
import Config from "../data/Config";
import Ledges from "./Ledges";
import Svg from "../Svg";

import { getMarketData } from "./util";

import PageSetup from "../PageSetup";

import addIndex from "ramda/src/addIndex";
import chain from "ramda/src/chain";
import map from "ramda/src/map";

const MarketPaginated = () => {
  let params = useParams();
  return (
    <Config>
      {(config, game) => {

        if (!game.stock || !game.stock.market) {
          return <Redirect to={`/${params.game}/background`} />;
        }

        let data = getMarketData(game.stock, config.stock, config.paper, config.pagination);

        let cells = [];
        switch (data.type) {
        case "1D":
          cells = addIndex(map)((cell, i) => (
            <g key={`cell-${i}`}
               transform={`translate(${i * data.width} 50)`}>
              <Cell cell={cell} data={data} />
            </g>
          ), game.stock.market || []);
          break;
        case "1Diag":
          cells = addIndex(map)((cell, i) => (
            <g key={`cell-${i}`}
               transform={`translate(${i * 0.5 * data.width} ${i % 2 === 0 ? 50 : data.height + 50})`}>
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

        let y = -25; // Start with room for margins
        let marketPages = map(height => {
          let x = -25; // Start with room for margins
          let pages = map(width => {
            let page = (
              <div
                key={`page-${x}-${y}`}
                className="cutlines"
                style={{
                  width: `${(width + 25) / 100}in`,
                  height: `${(height + 25) / 100}in`,
                  float: "none",
                  margin: "auto auto",
                  boxSizing: "content-box"
                }}
              >
                <div className="MapPage">
                  <svg
                    style={{
                      width: `${(width + 25) / 100}in`,
                      height: `${(height + 25) / 100}in`
                    }}
                    viewBox={`${x - 12.5} ${y - 12.5} ${width + 25} ${height + 25}`}
                  >
                    <use href={`#${game.info.abbrev || game.info.title}_market`} />
                  </svg>
                </div>
              </div>
            );

            x = x + width;
            return page;
          }, data.splitPages(data.totalWidth + 50, data.usableWidth));

          y = y + height;
          return pages;
        }, data.splitPages(data.totalHeight + 50, data.usableHeight));

        let defs = (
          <g id={`${game.info.abbrev || game.info.title}_market`}>
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
          </g>
        );

        return (
          <React.Fragment>
            <div className="PrintNotes">
              <div>
                <p>This market is meant to be printed in <b>{data.landscape ? "landscape" : "portrait"}</b> mode</p>
              </div>
            </div>
            <Svg className="FullMarket" defs={defs} />
            {marketPages}
            <PageSetup landscape={data.landscape} />
          </React.Fragment>
        );
      }}
    </Config>
  );
};

export default MarketPaginated;
