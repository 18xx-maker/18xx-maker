import { Navigate } from "react-router";

import Editor, { useEditing } from "@/components/Editor";
import Market from "@/components/market/Market";

import { unitsToCss } from "@/util";
import { getMarketData } from "@/util/market";

const MarketSingle = ({ config, game }) => {
  const editing = useEditing();

  if (!game.stock || !game.stock.market) {
    return <Navigate to={`/games/${game.meta.slug}/`} replace />;
  }

  let data = getMarketData(game.stock, config);
  let paperWidth = unitsToCss(data.totalWidth + 5 + 2 * config.paper.margins);
  let paperHeight = unitsToCss(data.totalHeight + 5 + 2 * config.paper.margins);

  // The editor fills the window, no inline box and no margin around it
  const frame = editing ? undefined : { display: "inline-block" };
  const stockFrame = editing ? { margin: 0 } : { display: "inline-block" };

  return (
    <div className="printElement" style={frame}>
      <div
        className="stock"
        data-testid={`game-${game.meta.slug}-market`}
        style={stockFrame}
      >
        <Editor width={data.totalWidth} height={data.totalHeight}>
          <Market
            data={data}
            game={game}
            config={config}
            title={game.info.title}
          />
        </Editor>
        <style>{`@media print {@page {size: ${paperWidth} ${paperHeight}; margin: ${unitsToCss(config.paper.margins)}}}`}</style>
      </div>
    </div>
  );
};

export default MarketSingle;
