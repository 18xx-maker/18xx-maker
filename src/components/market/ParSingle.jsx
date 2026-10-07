import Par from "@/components/market/Par";
import StockFrame from "@/components/market/StockFrame";

import { Redirect } from "@/router";
import { getParData } from "@/util/market";

const ParSingle = ({ config, game }) => {
  if (!game.stock || !game.stock.par || !game.stock.par.values) {
    return <Redirect to={`/games/${game.meta.slug}/`} replace />;
  }

  let data = getParData(game.stock, config);

  return (
    <StockFrame name="par" game={game} config={config} data={data}>
      <Par data={data} title={`${game.info.title} Par`} />
    </StockFrame>
  );
};

export default ParSingle;
