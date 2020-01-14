import React from "react";

import Config from "../data/Config";
import RoundTracker from "../RoundTracker";

const MapRoundTracker = ({game, hexWidth}) => {
  let roundTracker = game.roundTracker;

  if (!roundTracker) {
    return null;
  }

  let scale = hexWidth / 150.0;
  let x = (roundTracker.x || 0) * scale + 50;
  let y = (roundTracker.y || 0) * scale + 50;

  return (
    <Config>
      {(config, game) => {
        let rounds = game.rounds;
        let size = config.tokens.marketTokenSize;
        let type = roundTracker.type || "row";

        return (
          <g transform={`translate(${x} ${y})`}>
            <RoundTracker {...{rounds, size, type}} />
          </g>
        );
      }}
    </Config>
  );
};

export default MapRoundTracker;
