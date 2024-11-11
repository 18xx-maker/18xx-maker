import { useBooleanParam } from "@/util/query";
import { useConfig, useGame } from "@/hooks";

import MarketSingle from "@/market/MarketSingle";
import MarketPaginated from "@/market/MarketPaginated";

const Market = () => {
  const { config } = useConfig();
  const game = useGame();

  const [paginated] = useBooleanParam("paginated");

  return paginated ? (
    <MarketPaginated {...{ game, config }} />
  ) : (
    <MarketSingle {...{ game, config }} />
  );
};

export default Market;
