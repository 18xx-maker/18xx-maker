import React from "react";
import { Redirect, useParams } from "react-router-dom";

import Config from "../data/Config";
import Paginate from "../util/Paginate";

import { getMarketData } from "./util";

import Market from "./Market";

const MarketPaginated = () => {
  let params = useParams();
  return (
    <Config>
      {(config, game) => {
        if (!game.stock || !game.stock.market) {
          return <Redirect to={`/${params.game}/background`} />;
        }

        let data = getMarketData(game.stock, config);

        return <Paginate component="Market" data={data}>
            <Market data={data} title={game.info.title} />
          </Paginate>;
      }}
    </Config>
  );
};

export default MarketPaginated;
