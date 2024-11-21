import { useConfig, useGame } from "@/hooks";

import Paginate from "@/util/Paginate";

import { getRevenueData } from "@/market/util";

import Revenue from "@/market/Revenue";

const RevenuePaginated = () => {
  const { config } = useConfig();
  const game = useGame();
  let data = getRevenueData(game.revenue, config);

  return (
    <Paginate component="Revenue" config={config} game={game} data={data}>
      <Revenue data={data} config={config} game={game} />
    </Paginate>
  );
};

export default RevenuePaginated;
