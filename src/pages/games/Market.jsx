import MarketPaginated from "@/components/market/MarketPaginated";
import MarketSingle from "@/components/market/MarketSingle";
import { useConfig, useGame } from "@/hooks";
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
