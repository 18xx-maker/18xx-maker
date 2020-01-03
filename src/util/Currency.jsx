import React from "react";
import { connect } from 'react-redux';
import is from "ramda/src/is";

import games from "../data/games";

import GameContext from "../context/GameContext";

export const format = (value, gameName, doCurrencyFormat) => {
  if (value === null || value === undefined) {
    return null;
  } else if (is(String, value)) {
    return value;
  } else if (doCurrencyFormat) {
    let game = gameName;
    if (is(String, gameName)) {
      game = games[gameName];
    }
    let currency = game.info.currency || "USD";

    if (currency.indexOf("#") >= 0) {
      return currency.replace("#", Number(value).toLocaleString([], { mimimumFractionDigits: 0 }));
    } else {
      return Number(value).toLocaleString([], { style: "currency", currency, minimumFractionDigits: 0 });
    }
  } else {
    return `${value}`;
  }
}

const Currency = ({value, type, config}) => {
  let converter = gameContext => format(value, gameContext, config[type]);
  return <GameContext.Consumer>{converter}</GameContext.Consumer>;
}

const mapStateToProps = state => ({
  config: state.config.currency
});

export default connect(mapStateToProps)(Currency);
