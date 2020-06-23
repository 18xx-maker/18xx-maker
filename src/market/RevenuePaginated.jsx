import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";
import GameContext from "../context/GameContext";

import Paginate from "../util/Paginate";

import { getRevenueData } from "./util";

import Revenue from "./Revenue";

const RevenuePaginated = () => {
  const { config } = useContext(ConfigContext);
  const { game } = useContext(GameContext);
  let data = getRevenueData(game.revenue, config);

  return <Paginate component="Revenue"
                   config={config}
                   game={game}
                   data={data}>
           <Revenue data={data}
                    config={config}
                    game={game}/>
         </Paginate>;
};

export default RevenuePaginated;
