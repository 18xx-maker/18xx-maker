import { useNavigate } from "react-router";

import Svg from "@/components/Svg";
import Market from "@/components/market/Market";
import { unitsToCss } from "@/util";
import { getMarketData } from "@/util/market";

const MarketSingle = ({ config, game }) => {
  const navigate = useNavigate();

  if (!game.stock || !game.stock.market) {
    navigate(`/games/${game.meta.slug}/`);
  }

  let data = getMarketData(game.stock, config);
  let paperWidth = unitsToCss(data.totalWidth + 5 + 2 * config.paper.margins);
  let paperHeight = unitsToCss(data.totalHeight + 5 + 2 * config.paper.margins);

  return (
    <div className="printElement" style={{ display: "inline-block" }}>
      <div
        className="stock"
        data-testid={`game-${game.meta.slug}-market`}
        style={{ display: "inline-block" }}
      >
        <Svg
          width={data.css.totalWidth}
          height={data.css.totalHeight}
          viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}
        >
          <Market
            data={data}
            game={game}
            config={config}
            title={game.info.title}
          />
        </Svg>
        <style>{`@media print {@page {size: ${paperWidth} ${paperHeight}; margin: ${unitsToCss(config.paper.margins)}}}`}</style>
      </div>
    </div>
  );
};

export default MarketSingle;
