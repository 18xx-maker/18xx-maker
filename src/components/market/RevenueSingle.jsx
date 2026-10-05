import Editor, { useEditing } from "@/components/Editor";
import Svg from "@/components/Svg";
import Revenue from "@/components/market/Revenue";

import { useConfig, useGame } from "@/hooks";
import { unitsToCss } from "@/util";
import { getRevenueData } from "@/util/market";

const RevenueSingle = () => {
  const { config } = useConfig();
  const game = useGame();
  const editing = useEditing();

  let data = getRevenueData(game.revenue, config);
  let paperWidth = unitsToCss(data.totalWidth + 5 + 2 * config.paper.margins);
  let paperHeight = unitsToCss(data.totalHeight + 5 + 2 * config.paper.margins);

  // The editor fills the window, no inline box and no margin around it
  const frame = editing ? undefined : { display: "inline-block" };
  const stockFrame = editing ? { margin: 0 } : { display: "inline-block" };

  return (
    <div className="printElement" style={frame}>
      <div
        className="stock"
        data-testid={`game-${game.meta.slug}-revenue`}
        style={stockFrame}
      >
        {editing ? (
          <Editor
            width={data.totalWidth}
            height={data.totalHeight}
            padding={0.08}
          >
            <Revenue data={data} config={config} game={game} />
          </Editor>
        ) : (
          <Svg
            width={data.css.totalWidth}
            height={data.css.totalHeight}
            viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}
          >
            <Revenue data={data} config={config} game={game} />
          </Svg>
        )}
        <style>{`@media print {@page {size: ${paperWidth} ${paperHeight}; margin: ${unitsToCss(config.paper.margins)}}}`}</style>
      </div>
    </div>
  );
};

export default RevenueSingle;
