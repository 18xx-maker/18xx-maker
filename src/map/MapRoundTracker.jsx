import React from "react";

import Config from "../data/Config";
import RoundTracker from "../RoundTracker";

const MapRoundTracker = ({roundTracker, hexWidth}) => {
  if (!roundTracker) {
    return null;
  }

  let scale = hexWidth / 150.0;
  let x = (roundTracker.x || 0) * scale + 50;
  let y = (roundTracker.y || 0) * scale + 50;

  return (
    <Config>
      {(config, game) => {
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
      }}
    </Config>
  );
};

export default MapRoundTracker;
