import React from "react";
import { connect } from 'react-redux';
import is from "ramda/src/is";

import games from "../data/games";

import GameContext from "../context/GameContext";

const Currency = ({value, type, config}) => {
  let converter = gameContext => {
    let game = games[gameContext];
    let currency = game.currency || "USD";
    return Number(value).toLocaleString([], { style: "currency", currency, minimumFractionDigits: 0 });
  }

  if (value === null || value === undefined) {
    return null;
  } else if (is(String, value)) {
    return value;
  } else if (config[type]) {
    return <GameContext.Consumer>{converter}</GameContext.Consumer>;
  } else {
    return `${value}`;
  }
}

const mapStateToProps = state => ({
  config: state.config.currency
});

export default connect(mapStateToProps)(Currency);
