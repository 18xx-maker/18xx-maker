import React from "react";
import games from "./data/games";
import util from "./util";
import Market from "./Market";
import * as mutil from "./market-utils";
import * as data from "./data";
import * as R from "ramda";
import { Redirect } from "react-router-dom";

import Rounds from "./Rounds";
import Par from "./Par";
import Legend from "./Legend";

import GameContext from "./context/GameContext";
import "./StockPaginated.css";

const splitPages = data.pagination === "max" ? util.maxPages : util.equalPages;

const StockPaginated = ({ match }) => {
  let game = games[match.params.game];
  let stock = game.stock;
  let cell = stock.cell || "auto";

  if (cell === "auto") {
    return <Redirect to={`/${match.params.game}/stock`} />;
  }

  let totalWidth = 100.0 * (0.26 + cell.width * mutil.width(game.stock.market));
  let totalHeight =
      100.0 * (0.76 + cell.height * mutil.height(game.stock.market));

  let pageWidth = data.paper.width - 75;
  let pageHeight = data.paper.height - 75;

  if (stock.orientation === "landscape") {
    let tmp = pageWidth;
    pageWidth = pageHeight;
    pageHeight = tmp;
  }

  let y = 12.5; // Start with room for margins
  let stockPages = R.map(height => {
    let x = 12.5; // Start with room for margins
    let pages = R.map(width => {
      let page = (
        <div
          key={`page-${x}-${y}`}
          className="cutlines"
          style={{
            width: `${(width + 25) / 100}in`,
            height: `${(height + 25) / 100}in`,
            float: "none",
            margin: "auto auto"
          }}
        >
          <div className="cutlines-inner">
            <div
              className="StockPageWrapper"
              style={{
                width: `${(width + 25) / 100}in`,
                height: `${(height + 25) / 100}in`,
                overflow: "hidden",
                position: "relative"
              }}
            >
              <div
                className="StockPage"
                style={{
                  position: "absolute",
                  padding: "0.125in",
                  width: `${totalWidth / 100}in`,
                  height: `${totalHeight / 100}in`,
                  left: `${x / 100}in`,
                  top: `${y / 100}in`
                }}
              >
                <Market {...stock} />
                <div className="StockHelpers">
                  {stock.par &&
                   stock.par.values && (
                     <Par par={stock.par} legend={stock.legend || []} />
                   )}
                  <Rounds
                    rounds={game.rounds}
                    horizontal={game.stock.type === "2D" ? false : true}
                  />
                  <Legend
                    legend={game.stock.legend || []}
                    movement={game.stock.movement}
                    horizontal={game.stock.type === "2D" ? false : true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

      x = x - width;
      return page;
    }, splitPages(totalWidth + 25, pageWidth));

    y = y - height;
    return pages;
  }, splitPages(totalHeight, pageHeight));

  return (
    <GameContext.Provider value={match.params.game}>
      <div className="stock">
        <div className="PrintNotes">
          Stock Market is meant to be printed in{" "}
          <b>{stock.orientation || "landscape"}</b> mode
        </div>
        {stockPages}
        <style>{`@media print {@page {size: ${stock.orientation === "landscape" ? "11in 8.5in" : "8.5in 11in"};}}`}</style>
      </div>
    </GameContext.Provider>
  );
};

export default StockPaginated;
