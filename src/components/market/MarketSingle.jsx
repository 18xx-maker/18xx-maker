import Market from "@/components/market/Market";
import StockFrame from "@/components/market/StockFrame";

import { Redirect } from "@/router";
import { getMarketData } from "@/util/market";

const MarketSingle = ({ config, game }) => {
  if (!game.stock || !game.stock.market) {
    return <Redirect to={`/games/${game.meta.slug}/`} replace />;
  }

  let data = getMarketData(game.stock, config);

  return (
    <StockFrame
      name="market"
      game={game}
      config={config}
      data={data}
      editorOnly
    >
      <Market data={data} game={game} config={config} title={game.info.title} />
    </StockFrame>
  );
};

export default MarketSingle;
