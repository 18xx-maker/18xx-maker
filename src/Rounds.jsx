import React, { useContext } from "react";
import GameContext from "./context/GameContext";
import ConfigContext from "./context/ConfigContext";

import RoundTracker, { getRoundTrackerData } from "./RoundTracker";

const Rounds = () => {
  const { game } = useContext(GameContext);
  const { config } = useContext(ConfigContext);

  const rounds = game.rounds;
  const size = config.tokens.stationTokenSize;
  const type = (game.roundTracker && game.roundTracker.type) || "row";

  const data = getRoundTrackerData(rounds, size, type);

  return (
    <svg viewBox={`${data.startX} ${data.startY} ${data.width} ${data.height}`} width={data.css.width} height={data.css.height}>
      <RoundTracker {...{rounds,size,type}} />
    </svg>
  );
};

export default Rounds;
