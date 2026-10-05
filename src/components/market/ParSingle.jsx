import { Navigate } from "react-router";

import Editor, { useEditing } from "@/components/Editor";
import Svg from "@/components/Svg";
import Par from "@/components/market/Par";

import { unitsToCss } from "@/util";
import { getParData } from "@/util/market";

const ParSingle = ({ config, game }) => {
  const editing = useEditing();

  if (!game.stock || !game.stock.par || !game.stock.par.values) {
    return <Navigate to={`/games/${game.meta.slug}/`} replace />;
  }

  let data = getParData(game.stock, config);

  let paperWidth = data.totalWidth + 5 + 2 * config.paper.margins;
  let paperHeight = data.totalHeight + 5 + 2 * config.paper.margins;
  let cssPaperWidth = unitsToCss(paperWidth);
  let cssPaperHeight = unitsToCss(paperHeight);

  // The editor fills the window, no inline box and no margin around it
  const frame = editing ? undefined : { display: "inline-block" };
  const stockFrame = editing ? { margin: 0 } : { display: "inline-block" };

  return (
    <div className="printElement" style={frame}>
      <div
        className="stock"
        data-testid={`game-${game.meta.slug}-par`}
        style={stockFrame}
      >
        {editing ? (
          <Editor
            width={data.totalWidth}
            height={data.totalHeight}
            padding={0.08}
          >
            <Par data={data} title={`${game.info.title} Par`} />
          </Editor>
        ) : (
          <Svg
            width={data.css.totalWidth}
            height={data.css.totalHeight}
            viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}
          >
            <Par data={data} title={`${game.info.title} Par`} />
          </Svg>
        )}
        <style>{`@media print {@page {size: ${cssPaperWidth} ${cssPaperHeight}; margin: ${unitsToCss(config.paper.margins)}}}`}</style>
      </div>
    </div>
  );
};

export default ParSingle;
