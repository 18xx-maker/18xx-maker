import { useContext } from "react";
import is from "ramda/src/is";

import GameContext from "../context/GameContext";
import ConfigContext from "../context/ConfigContext";

export const format = (value, game, doCurrencyFormat) => {
  if (value === null || value === undefined) {
    return null;
  } else if (is(String, value)) {
    return value;
  } else if (doCurrencyFormat) {
    let currency = game.info.currency || "$#";

    return currency.replace("#", Number(value).toLocaleString([], { mimimumFractionDigits: 0 }));
  } else {
    return `${value}`;
  }
}

const Currency = ({value, type}) => {
  const { game } = useContext(GameContext);
  const { config } = useContext(ConfigContext);

  return format(value, game, config.currency[type]);
}

export default Currency;
