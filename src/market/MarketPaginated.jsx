import React from "react";
import { Redirect } from "react-router-dom";

import Paginate from "../util/Paginate";

import { getMarketData } from "./util";

import Market from "./Market";

const MarketPaginated = ({ config, game }) => {
  if (!game.stock || !game.stock.market) {
    return <Redirect to={`/games/${game.slug}/`} />;
  }

  let data = getMarketData(game.stock, config);

  return <Paginate component="Market"
                   game={game}
                   config={config}
                   data={data}>
           <Market data={data}
                   game={game}
                   config={config}
                   title={game.info.title} />
         </Paginate>;
};

export default MarketPaginated;
