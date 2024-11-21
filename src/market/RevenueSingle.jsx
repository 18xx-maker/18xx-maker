import { useConfig, useGame } from "@/hooks";

import Svg from "@/Svg";

import { getRevenueData } from "@/market/util";
import { unitsToCss } from "@/util";

import Revenue from "@/market/Revenue";

const RevenueSingle = () => {
  const { config } = useConfig();
  const game = useGame();

  let data = getRevenueData(game.revenue, config);
  let paperWidth = unitsToCss(data.totalWidth + 5 + 2 * config.paper.margins);
  let paperHeight = unitsToCss(data.totalHeight + 5 + 2 * config.paper.margins);

  return (
    <div className="printElement" style={{ display: "inline-block" }}>
      <div className="stock" style={{ display: "inline-block" }}>
        <Svg
          width={data.css.totalWidth}
          height={data.css.totalHeight}
          viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}
        >
          <Revenue data={data} config={config} game={game} />
        </Svg>
        <style>{`@media print {@page {size: ${paperWidth} ${paperHeight}; margin: ${unitsToCss(config.paper.margins)}}}`}</style>
      </div>
    </div>
  );
};

export default RevenueSingle;
