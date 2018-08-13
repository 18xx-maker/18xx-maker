import React from "react";
import Market from "./Market";
import games from "./data/games";

import Rounds from "./Rounds";
import Par from "./Par";
import Legend from "./Legend";

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
        {stock.par && stock.par.values && <Par par={stock.par} legend={stock.legend || []} />}
        <Rounds rounds={game.rounds} horizontal={game.stock.type === "2D" ? false : true} />
        <Legend legend={game.stock.legend || []} movement={game.stock.movement} horizontal={game.stock.type === "2D" ? false : true} />
      </div>
    </div>
  );
};

export default Stock;
