import Editor, { useEditing } from "@/components/editor/Editor";
import Svg from "@/components/svg/Svg";

import { unitsToCss } from "@/util";

// The print box around a single market, par or revenue chart: the editor when
// editing, an svg otherwise, and the page size of the printed sheet.
const StockFrame = ({
  name,
  game,
  config,
  data,
  editorOnly = false,
  children,
}) => {
  const editing = useEditing();

  const paperWidth = unitsToCss(data.totalWidth + 5 + 2 * config.paper.margins);
  const paperHeight = unitsToCss(
    data.totalHeight + 5 + 2 * config.paper.margins,
  );

  // The editor fills the window, no inline box and no margin around it
  const frame = editing ? undefined : { display: "inline-block" };
  const stockFrame = editing ? { margin: 0 } : { display: "inline-block" };

  const editor = (
    <Editor width={data.totalWidth} height={data.totalHeight} padding={0.08}>
      {children}
    </Editor>
  );

  return (
    <div className="printElement" style={frame}>
      <div
        className="stock"
        data-testid={`game-${game.meta.slug}-${name}`}
        style={stockFrame}
      >
        {editorOnly || editing ? (
          editor
        ) : (
          <Svg
            width={data.css.totalWidth}
            height={data.css.totalHeight}
            viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}
          >
            {children}
          </Svg>
        )}
        <style>{`@media print {@page {size: ${paperWidth} ${paperHeight}; margin: ${unitsToCss(config.paper.margins)}}}`}</style>
      </div>
    </div>
  );
};

export default StockFrame;
