import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";
import GameContext from "../context/GameContext";

import RoundTracker from "../RoundTracker";

const MapRoundTracker = ({roundTracker, hexWidth}) => {
  const { game } = useContext(GameContext);
  const { config } = useContext(ConfigContext);

  if (!roundTracker) {
    return null;
  }

  let scale = hexWidth / 150.0;
  let x = (roundTracker.x || 0) * scale + 50;
  let y = (roundTracker.y || 0) * scale + 50;

  if (!config.maps.roundTracker) {
    return null;
  }

  let rounds = game.rounds;
  let size = config.tokens.marketTokenSize;
  let type = roundTracker.type || "row";
  let rotation = roundTracker.rotation || 0;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <RoundTracker {...{rounds, size, type, rotation}} />
    </g>
  );
};

export default MapRoundTracker;
