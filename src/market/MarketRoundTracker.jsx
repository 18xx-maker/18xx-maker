import React from "react";

import RoundTracker from "../RoundTracker";

const MarketRoundTracker = ({roundTracker, game, config}) => {
  if (!roundTracker) {
    return null;
  }

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
};

export default MarketRoundTracker;
