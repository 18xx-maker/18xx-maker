import React from "react";

import RoundTracker, { getRoundTrackerData } from "./RoundTracker";

import Config from "./data/Config";

const Rounds = () => {
  return (
    <div className="rounds">
      <Config>
        {(config, game) => {
          let rounds = game.rounds;
          let size = config.tokens.stationTokenSize;
          let type = (game.roundTracker && game.roundTracker.type) || "row";

          let data = getRoundTrackerData(rounds, size, type);

          return (
            <svg viewBox={`${data.startX} ${data.startY} ${data.width} ${data.height}`} width={data.css.width} height={data.css.height}>
              <RoundTracker {...{rounds,size,type}} />
            </svg>
          );
        }}
      </Config>
    </div>
  );
};

export default Rounds;
