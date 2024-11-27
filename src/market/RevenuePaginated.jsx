import Paginate from "@/components/Paginate";
import { useConfig, useGame } from "@/hooks";
import Revenue from "@/market/Revenue";
import { getRevenueData } from "@/util/market";

const RevenuePaginated = () => {
  const { config } = useConfig();
  const game = useGame();
  let data = getRevenueData(game.revenue, config);

  return (
    <div
      className="stock"
      data-testid={`game-${game.meta.slug}-revenue-paginated`}
    >
      <Paginate component="Revenue" config={config} game={game} data={data}>
        <Revenue data={data} config={config} game={game} />
      </Paginate>
    </div>
  );
};

export default RevenuePaginated;
