import { addIndex, chain, concat, map, reverse } from "ramda";

import Color from "@/components/Color";
import Legend from "@/components/Legend";
import Cell from "@/components/market/Cell";
import Ledges from "@/components/market/Ledges";
import MarketRoundTracker from "@/components/market/MarketRoundTracker";
import Par from "@/components/market/Par";

import { multiDefaultTo } from "@/util";
import { getParData } from "@/util/market";

// The legend entries in a row, each as wide as its description
const poolNotes = (legend, left, y) => (
  <g>
    {addIndex(map)((legend, i) => {
      let current = left;
      left += 100 + legend.description.length * 6.5;
      return (
        <g key={`pool-note-${i}`} transform={`translate(${current} ${y})`}>
          <Legend {...legend} />
        </g>
      );
    }, legend)}
  </g>
);

const Market = ({ data, game, config, title, displayTitle }) => {
  const pass = { game, config, data };
  const titleY = data.stock.title === false ? 0 : 50;
  const keepBottom = (cell) => (cell && cell.bottom ? cell : null);
  const dropBottom = (cell) => (cell && cell.bottom ? null : cell);
  const cellGroup = (key, transform, cell) => (
    <g key={key} transform={transform}>
      <Cell cell={cell} {...pass} />
    </g>
  );

  // The cells that sit on the bottom are drawn first, so the others cover them
  let renderLayer;
  switch (data.type) {
    case "1D":
      renderLayer = (name, select) =>
        addIndex(map)(
          (cell, i) =>
            cellGroup(
              `cell-${name}-${i}`,
              `translate(${i * data.width} ${titleY})`,
              cell,
            ),
          map(select, data.market || []),
        );
      break;
    case "1Diag":
      renderLayer = (name, select) =>
        addIndex(map)(
          (cell, i) =>
            cellGroup(
              `cell-${name}-${i}`,
              `translate(${i * 0.5 * data.width} ${i % 2 === 0 ? titleY : titleY + data.height})`,
              cell,
            ),
          map(select, data.market || []),
        );
      break;
    default:
      // 2D
      renderLayer = (name, select) =>
        addIndex(chain)(
          (row, y) =>
            addIndex(map)(
              (cell, x) =>
                cellGroup(
                  `cell-${name}-${x}-${y}`,
                  `translate(${x * data.width} ${y * data.height + titleY})`,
                  cell,
                ),
              row,
            ),
          map((row) => map(select, row), data.market || []),
        );
      break;
  }
  const cells = concat(
    renderLayer("bottom", keepBottom),
    renderLayer("top", dropBottom),
  );

  let roundTracker = null;
  if (data.display.roundTracker) {
    roundTracker = (
      <MarketRoundTracker
        roundTracker={data.display.roundTracker}
        game={game}
        config={config}
      />
    );
  }

  let par = null;
  if (data.config.stock.display.par && data.display.par) {
    // We want to display par chart on the market
    let x = data.display.par.x * data.config.stock.cell.width;
    let y = data.display.par.y * data.config.stock.cell.height;
    par = (
      <g
        transform={`translate(${x} ${y + (data.stock.title === false ? 0 : 50)})`}
      >
        <Par title="Par" data={getParData(data.stock, data.config)} />
      </g>
    );
  }

  let legendNode = null;

  if (data.type === "2D") {
    if (
      config.stock.display.legend &&
      game.stock.display &&
      game.stock.display.legend
    ) {
      let legend = (game.stock && game.stock.legend) || [];
      if (game.stock.display.legend.reverse) {
        legend = reverse(legend);
      }
      let x = game.stock.display.legend.x * config.stock.cell.width;
      let y = game.stock.display.legend.y * config.stock.cell.height;

      legendNode = (
        <Color context="companies">
          {() => (
            <g>
              {addIndex(map)(
                (legend, i) => (
                  <g
                    key={`pool-note-${i}`}
                    transform={`translate(${x} ${y + (data.stock.title === false ? 0 : 50) + i * (game.stock.display.legend.verticalAlign === "bottom" ? -35 : 35)})`}
                  >
                    <Legend
                      right={game.stock.display.legend.align === "right"}
                      bottom={
                        game.stock.display.legend.verticalAlign === "bottom"
                      }
                      reverse={game.stock.display.legend.reverse}
                      {...legend}
                    />
                  </g>
                ),
                legend,
              )}
            </g>
          )}
        </Color>
      );
    }
  } else if (data.type === "1D") {
    if (config.stock.display.legend) {
      let legend = (game.stock && game.stock.legend) || [];

      legendNode = poolNotes(
        legend,
        0,
        1 * data.height + (data.stock.title === false ? 25 : 75),
      );
    }
  } else if (data.type === "1Diag") {
    if (config.stock.display.legend) {
      let legend = (game.stock && game.stock.legend) || [];
      let left = 0;
      let y = 2 * data.height + (data.stock.title === false ? 25 : 75);

      if (game.stock.display && game.stock.display.legend) {
        if (game.stock.display.legend.x) {
          left = game.stock.display.legend.x;
        }
        if (game.stock.display.legend.y) {
          y = game.stock.display.legend.y;
        }
      }

      legendNode = poolNotes(legend, left, y);
    }
  }

  var titleFont = multiDefaultTo("display", game.info.titleFontFamily);
  return (
    <g>
      {displayTitle === false || (
        <text
          fontFamily={titleFont}
          fontStyle="bold"
          fontSize="25"
          dominantBaseline="hanging"
          x="0"
          y="12.5"
        >
          {title} Stock Market
        </text>
      )}
      {roundTracker}
      {cells}
      {par}
      {legendNode}
      <Ledges data={data} />
    </g>
  );
};

export default Market;
