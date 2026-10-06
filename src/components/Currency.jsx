import { useConfig, useGame } from "@/hooks";
import { format } from "@/util/currency";

const Currency = ({ value, type, format: valueFormat }) => {
  const game = useGame();
  const { config } = useConfig();

  return format(value, game, config.currency[type], valueFormat);
};

export default Currency;
