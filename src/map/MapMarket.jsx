import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";
import GameContext from "../context/GameContext";

import { getMarketData } from "../market/util";
import Market from "../market/Market";

const MapMarket = ({mapMarket, hexWidth}) => {
  const { game } = useContext(GameContext);
  const { config } = useContext(ConfigContext);

  if (!mapMarket) {
    return null;
  }

  let scale = hexWidth / 150.0;
  let x = (mapMarket.x || 0) * scale + 50;
  let y = (mapMarket.y || 0) * scale + 50;

  if (!config.maps.market) {
    return null;
  }

  let data = getMarketData(game.stock, config);
  let displayTitle = false;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Market {...{data, game, config, displayTitle}}/>
    </g>
  );
};

export default MapMarket;
