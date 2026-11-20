import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import Market from "@/components/market/Market";
import { ACCENT, CompanyToken } from "@/components/play/PlayMap";
import { CompanyPreview } from "@/components/play/TokenPanel";
import Svg from "@/components/svg/Svg";

import { cn } from "@/util/cn";
import { getMarketData, marketCells } from "@/util/market";

// The default token width, as the cells of the print market draw them
const WIDTH = 25;
// Room for the value of a cell, at its top (or bottom), and around markers
const LABEL = 20;
const PAD = 2;

// Where the markers of one cell go. One sits where the print cells draw a
// token; more go in the grid that gives them the largest size, beside the
// value of the cell, rows centered.
const stackLayout = (cell, n, valueAt) => {
  if (n === 1) {
    return {
      width: WIDTH,
      points: [{ x: cell.width / 2, y: cell.height / 2 + 2 }],
    };
  }
  const top = valueAt === "bottom" ? PAD : LABEL;
  const room = cell.height - LABEL - PAD;
  let best = null;
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const width = Math.min(
      WIDTH,
      (cell.width - 2 * PAD) / (2 * cols),
      room / (2 * rows),
    );
    if (!best || width > best.width) best = { cols, rows, width };
  }
  const { cols, rows, width } = best;
  const y0 = top + (room - rows * 2 * width) / 2 + width;
  const points = Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / cols);
    const inRow = Math.min(cols, n - row * cols);
    return {
      x: (cell.width - inRow * 2 * width) / 2 + width + (i % cols) * 2 * width,
      y: y0 + row * 2 * width,
    };
  });
  return { width, points };
};

const BaseMarket = memo(Market);

const TargetLayerView = ({ cells }) =>
  cells.map((cell) => (
    <rect
      key={`${cell.row}-${cell.col}`}
      data-market-cell={`${cell.row}-${cell.col}`}
      transform={`translate(${cell.x} ${cell.y})`}
      width={cell.width}
      height={cell.height}
      fill="transparent"
      style={{ cursor: "pointer" }}
    />
  ));
const TargetLayer = memo(TargetLayerView);

// The markers of every cell that exists, in the order they first moved
const MarkerLayerView = ({ game, market, cells, chosen, valueAt }) => {
  const byCell = new Map(
    cells.map((cell) => [`${cell.row}-${cell.col}`, cell]),
  );
  const stacks = new Map();
  for (const [abbrev, { row, col }] of Object.entries(market)) {
    const cell = byCell.get(`${row}-${col}`);
    if (!cell) continue;
    if (!stacks.has(cell)) stacks.set(cell, []);
    stacks.get(cell).push(abbrev);
  }
  return [...stacks].flatMap(([cell, list]) => {
    const { width, points } = stackLayout(cell, list.length, valueAt);
    return list.map((abbrev, i) => (
      <g
        key={abbrev}
        data-marker={abbrev}
        transform={`translate(${cell.x} ${cell.y})`}
        pointerEvents="none"
      >
        <g transform={`translate(${points[i].x} ${points[i].y})`}>
          <CompanyToken game={game} abbrev={abbrev} width={width} />
          {chosen === abbrev && (
            <circle
              data-chosen-marker={abbrev}
              r={width + 3}
              fill="none"
              stroke={ACCENT}
              strokeWidth={3}
            />
          )}
        </g>
      </g>
    ));
  });
};
const MarkerLayer = memo(MarkerLayerView);

// The stock market of the board: the print market with the markers of the
// companies on their cells and a target on every cell. A click on a cell
// calls onMove with { row, col } (row 0 on a 1D or 1Diag market).
const PlayMarket = ({ game, config, state, chosen, onMove }) => {
  const { t } = useTranslation();
  const stock = game.stock;
  const data = useMemo(
    () => (stock?.market ? getMarketData(stock, config) : null),
    [stock, config],
  );
  const cells = useMemo(() => (data ? marketCells(data) : []), [data]);

  if (!data) {
    return <p className="p-2 text-sm">{t("play.board.market.none")}</p>;
  }

  const onClick = (event) => {
    const target = event.target.closest?.("[data-market-cell]");
    const cell =
      target &&
      cells.find((c) => `${c.row}-${c.col}` === target.dataset.marketCell);
    if (cell) onMove({ row: cell.row, col: cell.col });
  };

  return (
    <Svg
      data-play-market=""
      role="img"
      aria-label={t("play.board.market.label")}
      className="h-full w-full select-none"
      viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}
      onClick={onClick}
    >
      <BaseMarket
        data={data}
        game={game}
        config={config}
        title={game.info?.title}
      />
      <TargetLayer cells={cells} />
      <MarkerLayer
        game={game}
        market={state.market}
        cells={cells}
        chosen={chosen}
        valueAt={config.stock?.value}
      />
    </Svg>
  );
};

// The market tab: the companies whose marker to move
export const MarketPanel = ({ game, chosen, onChoose, locked }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {t("play.board.market.hint")}
      </p>
      <div className="grid grid-cols-2 gap-1">
        {(game.companies || []).map((c) => (
          <Button
            key={c.abbrev}
            variant="outline"
            data-marker-option={c.abbrev}
            aria-pressed={chosen === c.abbrev}
            disabled={locked}
            onClick={() => onChoose(chosen === c.abbrev ? null : c.abbrev)}
            className={cn(
              "h-auto justify-start p-1 text-left",
              chosen === c.abbrev && "border-primary bg-accent",
            )}
          >
            <CompanyPreview abbrev={c.abbrev} />
            <span className="truncate">{c.abbrev}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PlayMarket;
