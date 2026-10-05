import Revenue from "@/components/market/Revenue";
import StockFrame from "@/components/market/StockFrame";

import { useConfig, useGame } from "@/hooks";
import { getRevenueData } from "@/util/market";

const RevenueSingle = () => {
  const { config } = useConfig();
  const game = useGame();

  let data = getRevenueData(game.revenue, config);

  return (
    <StockFrame name="revenue" game={game} config={config} data={data}>
      <Revenue data={data} config={config} game={game} />
    </StockFrame>
  );
};

export default RevenueSingle;
