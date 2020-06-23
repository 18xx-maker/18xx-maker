import React, { useContext } from "react";
import { useBooleanParam } from "../../util/query";
import GameContext from "../../context/GameContext";
import ConfigContext from "../../context/ConfigContext";

import MarketSingle from "../../market/MarketSingle";
import MarketPaginated from "../../market/MarketPaginated";

const Market = () => {
  const { config } = useContext(ConfigContext);
  const { game } = useContext(GameContext);

  const [paginated] = useBooleanParam('paginated');

  return (paginated
          ? <MarketPaginated {...{game, config}}/>
          : <MarketSingle {...{game, config}}/>);
};

export default Market;
