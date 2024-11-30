import { useNavigate } from "react-router";

import Svg from "@/components/Svg";
import Par from "@/components/market/Par";

import { unitsToCss } from "@/util";
import { getParData } from "@/util/market";

const ParSingle = ({ config, game }) => {
  const navigate = useNavigate();

  if (!game.stock || !game.stock.par || !game.stock.par.values) {
    navigate(`/games/${game.meta.slug}/`);
  }

  let data = getParData(game.stock, config);

  let paperWidth = data.totalWidth + 5 + 2 * config.paper.margins;
  let paperHeight = data.totalHeight + 5 + 2 * config.paper.margins;
  let cssPaperWidth = unitsToCss(paperWidth);
  let cssPaperHeight = unitsToCss(paperHeight);

  return (
    <div className="printElement" style={{ display: "inline-block" }}>
      <div
        className="stock"
        data-testid={`game-${game.meta.slug}-par`}
        style={{ display: "inline-block" }}
      >
        <Svg
          width={data.css.totalWidth}
          height={data.css.totalHeight}
          viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}
        >
          <Par data={data} title={`${game.info.title} Par`} />
        </Svg>
        <style>{`@media print {@page {size: ${cssPaperWidth} ${cssPaperHeight}; margin: ${unitsToCss(config.paper.margins)}}}`}</style>
      </div>
    </div>
  );
};

export default ParSingle;
