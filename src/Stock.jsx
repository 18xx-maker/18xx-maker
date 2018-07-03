import React from "react";
import Market from "./Market";
import Par from "./Par";
import Rounds from "./Rounds";
import Revenue from "./Revenue";
import games from "./data/games";

const Stock = ({ match }) => {
  let game = games[match.params.game];
  let stock = game.stock;

  return (
    <div class="stock">
      <div class="prices">
        <Market
          market={stock.market}
          limits={stock.limits}
          par={stock.par}
          type={stock.type}
        />
        <Par par={stock.par} />
        <Rounds rounds={stock.rounds} />
      </div>
      <Revenue />
    </div>
  );
};

export default Stock;
