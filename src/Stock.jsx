import React from "react";
import Market from "./Market";
import games from "./data/games";

import Rounds from "./Rounds";
import Par from "./Par";

const Stock = ({ match }) => {
  let game = games[match.params.game];
  let stock = game.stock;

  if (!stock) {
    return null;
  }

  return (
    <div className="stock">
      <Market {...stock} />
      <Rounds rounds={game.rounds} />
      {stock.par && <Par par={stock.par} />}
    </div>
  );
};

export default Stock;
