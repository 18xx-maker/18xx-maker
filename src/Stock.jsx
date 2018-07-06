import React from "react";
import Market from "./Market";
import Pool from "./Pool";
import Revenue from "./Revenue";
import games from "./data/games";

const Stock = ({ match }) => {
  let game = games[match.params.game];
  let stock = game.stock;

  if(!stock) {
    return null;
  }

  return (
    <div class="stock">
      <div class="prices">
        <Market
          market={stock.market}
          limits={stock.limits}
          par={stock.par}
          type={stock.type}
          rounds={game.rounds}
        />
      </div>
      <Revenue />
      <div class="pools">{game.pools.map(pool => <Pool label={pool.name} notes={pool.notes} />)}</div>
    </div>
  );
};

export default Stock;
