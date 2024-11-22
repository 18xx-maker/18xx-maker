import { useConfig, useGame } from "@/hooks";
import MarketPaginated from "@/market/MarketPaginated";
import MarketSingle from "@/market/MarketSingle";
import { useBooleanParam } from "@/util/query";

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
