import React from "react";
import Market from "./Market";
import games from "./data/games";

import Rounds from "./Rounds";
import Par from "./Par";
import Legend from "./Legend";
import Movement from "./Movement";

import "./Stock.css";

const Stock = ({ match }) => {
  let game = games[match.params.game];
  let stock = game.stock;

  if (!stock) {
    return null;
  }

  return (
    <div className="stock">
      <div className="PrintNotes">
        Stock Market is meant to be printed in <b>landscape</b> mode
      </div>
      <Market {...stock} title={game.info.title} />
      <div className="StockHelpers">
        {stock.par && <Par par={stock.par} />}
        <Legend legend={game.stock.legend || []} movement={game.stock.movement} />
        <Rounds rounds={game.rounds} />
      </div>
    </div>
  );
};

export default Stock;
