import React from "react";
import { connect } from "react-redux";
import GameContext from "../context/GameContext";

import games from "./games";
import merge from "ramda/src/merge";

const Config = ({config, children}) => {
  return (
    <GameContext.Consumer>
      {gameName => {
        let game = games[gameName];
        let mergedConfig = merge(config, game.config);
        return children(mergedConfig, game);
      }}
    </GameContext.Consumer>
  );
};

const mapStateToProps = state => ({
  config: state.config
});

export default connect(mapStateToProps)(Config);
