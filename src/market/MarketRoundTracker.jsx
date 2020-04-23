import React from "react";

import Config from "../data/Config";
import RoundTracker from "../RoundTracker";

const MarketRoundTracker = ({roundTracker}) => {
  if (!roundTracker) {
    return null;
  }

  return (
    <Config>
      {(config, game) => {
        if (!config.stock.display.roundTracker) {
          return null;
        }

        let rounds = game.rounds;
        let size = config.tokens.marketTokenSize;
        let type = roundTracker.type || "row";
        let rotation = roundTracker.rotation || 0;

        let x = config.stock.cell.width * roundTracker.x;
        let y = config.stock.cell.height * roundTracker.y + (config.stock.title === false ? 0 : 50);

        return (
          <g transform={`translate(${x} ${y})`}>
            <RoundTracker {...{rounds, size, type, rotation}} />
          </g>
        );
      }}
    </Config>
  );
};

export default MarketRoundTracker;
