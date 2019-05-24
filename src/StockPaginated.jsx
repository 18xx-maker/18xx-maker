import React from "react";
import { Redirect } from "react-router-dom";

import { connect } from "react-redux";
import games from "./data/games";
import { equalPages, maxPages, printableWidth, printableHeight } from "./util";
import Market from "./Market";
import * as mutil from "./market-utils";
import * as R from "ramda";

import Rounds from "./Rounds";
import Par from "./Par";
import Legend from "./Legend";
import PageSetup from "./PageSetup";

import GameContext from "./context/GameContext";
import "./StockPaginated.css";

const StockPaginated = ({ match, cell, pagination, paper }) => {
  let game = games[match.params.game];

  if (!game.stock) {
    return <Redirect to={`/${match.params.game}/background`} />;
  }

  let stock = game.stock;

  let splitPages = pagination === "max" ? maxPages : equalPages;

  let totalWidth = 100.0 * (0.26 + ((1 + cell.width) / 100.0) * mutil.width((game && game.stock && game.stock.market) || []));
  let totalHeight = 50 + (100.0 * (0.76 + ((1 + cell.height) / 100.0) * mutil.height((game && game.stock && game.stock.market) || [])));

  let pageWidth = printableWidth(paper);
  let pageHeight = printableHeight(paper);

  if (stock && stock.orientation !== "portrait") {
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
                  {stock &&
                   stock.par &&
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
      <div className="PrintNotes">
        <div>
          <p>
            Stock Market is meant to be printed in{" "}
            <b>{stock.orientation || "landscape"}</b> mode
          </p>
        </div>
      </div>
      <div className="stock">
        {stockPages}
        <PageSetup landscape={stock.orientation !== "portrait"}/>
      </div>
    </GameContext.Provider>
  );
};

const mapStateToProps = state => ({
  cell: state.config.stock.cell,
  pagination: state.config.pagination,
  paper: state.config.paper
});

export default connect(mapStateToProps)(StockPaginated);
