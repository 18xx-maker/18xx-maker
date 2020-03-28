import React from "react";

import Config from "../data/Config";
import Paginate from "../util/Paginate";

import { getRevenueData } from "./util";

import Revenue from "./Revenue";

const RevenuePaginated = () => (
  <Config>
    {(config, game) => {
      let data = getRevenueData(game.revenue, config);

      return <Paginate component="Revenue" data={data}>
          <Revenue data={data} title={game.info.title} />
        </Paginate>;
    }}
  </Config>
);

export default RevenuePaginated;
