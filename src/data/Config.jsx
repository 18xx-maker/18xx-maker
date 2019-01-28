import React from "react";
import GameContext from "../context/GameContext";

import * as data from "./index";
import games from "./games";
import merge from "ramda/es/merge";

const Config = ({children}) => {
  return (
    <GameContext.Consumer>
      {gameName => {
        let game = games[gameName];
        let config = merge(data, game.config);
        return children(config, game);
      }}
    </GameContext.Consumer>
  );
};

export default Config;
