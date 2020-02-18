import React from "react";
import { Redirect, useParams } from "react-router-dom";

import Config from "../data/Config";
import Paginate from "../util/Paginate";

import { getParData } from "./util";

import Par from "./Par";

const ParPaginated = () => {
  let params = useParams();
  return (
    <Config>
      {(config, game) => {
        if (!game.stock || !game.stock.par || !game.stock.par.values) {
          return <Redirect to={`/${params.game}/background`} />;
        }

        let data = getParData(game.stock, config);

        return <Paginate component="Par" data={data}>
            <Par data={data} title={game.info.title} />
          </Paginate>;
      }}
    </Config>
  );
};

export default ParPaginated;
