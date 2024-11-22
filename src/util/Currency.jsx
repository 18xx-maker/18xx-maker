import { is } from "ramda";

import { useConfig, useGame } from "@/hooks";

export const format = (value, game, doCurrencyFormat) => {
  if (value === null || value === undefined) {
    return null;
  } else if (is(String, value)) {
    return value;
  } else if (doCurrencyFormat) {
    let currency = (game && game.info.currency) || "$#";

    return currency.replace(
      "#",
      Number(value).toLocaleString([], { minimumFractionDigits: 0 }),
    );
  } else {
    return `${value}`;
  }
};

const Currency = ({ value, type }) => {
  const game = useGame();
  const { config } = useConfig();

  return format(value, game, config.currency[type]);
};

export default Currency;
