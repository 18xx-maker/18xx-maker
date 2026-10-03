// Wrappers for the market stories: the market components take data computed
// from the game stock and the config, so these build it from story args. Not
// a story file: the stories import them as their render function.
import Cell from "@/components/market/Cell";
import Ledges from "@/components/market/Ledges";
import Market from "@/components/market/Market";
import MarketRoundTracker from "@/components/market/MarketRoundTracker";
import Par from "@/components/market/Par";
import ParCell from "@/components/market/ParCell";
import Revenue from "@/components/market/Revenue";
import { SizedSvg } from "@/components/storyFrames";

import { useConfig, useGame } from "@/hooks";
import { getMarketData, getParData, getRevenueData } from "@/util/market";

const empty = (v) => v === undefined || v === null || v === "";

// Only the fields that are set, so unset controls fall back to the defaults
const compact = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => !empty(v)));

const withStock = (config, { valuePosition, arrowPosition, display } = {}) => ({
  ...config,
  stock: {
    ...config.stock,
    value: valuePosition || config.stock.value,
    arrows: arrowPosition || config.stock.arrows,
    display: { ...config.stock.display, ...display },
  },
});

// One cell of a market, the args are the fields of a cell
export const CellStory = ({
  type = "2D",
  valuePosition,
  arrowPosition,
  legendColors = [],
  ...fields
}) => {
  const { config } = useConfig();
  const game = useGame();
  const cfg = withStock(config, { valuePosition, arrowPosition });
  const cell = compact(fields);
  const stock = {
    type,
    market: type === "2D" ? [[cell]] : [cell],
    legend: legendColors.map((color) => ({ color, description: color })),
  };
  const data = getMarketData(stock, cfg);

  return <Cell cell={cell} game={game} config={cfg} data={data} />;
};

// One cell of the par chart
export const ParCellStory = ({ parColor, legendColors = [], ...fields }) => {
  const { config } = useConfig();
  const cell = compact(fields);
  const stock = {
    par: { values: [cell], color: parColor || undefined },
    legend: legendColors.map((color) => ({ color, description: color })),
  };
  const data = getParData(stock, config);

  return <ParCell cell={cell} data={data} />;
};

// Ledges over a grid of cells, the args are the fields of one ledge
export const LedgesStory = ({ columns = 6, rows = 4, ...ledge }) => {
  const { config } = useConfig();
  const stock = {
    type: "2D",
    market: Array.from({ length: rows }, () => Array(columns).fill(0)),
    ledges: [compact(ledge)],
  };
  const data = getMarketData(stock, config);

  return (
    <SizedSvg width={data.totalWidth} height={data.totalHeight}>
      <g transform="translate(0 50)">
        {Array.from({ length: rows * columns }, (_, i) => (
          <rect
            key={i}
            x={(i % columns) * data.width}
            y={Math.floor(i / columns) * data.height}
            width={data.width}
            height={data.height}
            fill="none"
            stroke="gray"
          />
        ))}
      </g>
      <Ledges data={data} />
    </SizedSvg>
  );
};

// A whole stock market from a stock object
export const MarketStory = ({
  stock,
  valuePosition,
  arrowPosition,
  showLegend = true,
  showPar = true,
  showRoundTracker = true,
  displayTitle = true,
}) => {
  const { config } = useConfig();
  const game = { ...useGame(), stock };
  const cfg = withStock(config, {
    valuePosition,
    arrowPosition,
    display: {
      legend: showLegend,
      par: showPar,
      roundTracker: showRoundTracker,
    },
  });
  const data = getMarketData(stock, cfg);

  return (
    <SizedSvg width={data.totalWidth} height={data.totalHeight}>
      <Market
        data={data}
        game={game}
        config={cfg}
        title={game.info.title}
        displayTitle={displayTitle}
      />
    </SizedSvg>
  );
};

// The par chart of a stock
export const ParStory = ({ title, ...par }) => {
  const { config } = useConfig();
  const data = getParData({ par: compact(par) }, config);

  return (
    <SizedSvg width={data.totalWidth} height={data.totalHeight}>
      <Par data={data} title={title} />
    </SizedSvg>
  );
};

// The revenue chart of a game
export const RevenueStory = (revenue) => {
  const { config } = useConfig();
  const game = useGame();
  const data = getRevenueData(revenue, config);

  return (
    <SizedSvg width={data.totalWidth} height={data.totalHeight}>
      <Revenue data={data} config={config} game={game} />
    </SizedSvg>
  );
};

// The round tracker as it is placed on a market
export const MarketRoundTrackerStory = ({
  rounds,
  showRoundTracker,
  ...tracker
}) => {
  const { config } = useConfig();
  const game = { ...useGame(), rounds };
  const cfg = withStock(config, {
    display: { roundTracker: showRoundTracker },
  });

  return (
    <SizedSvg x={-150} y={-150} width={700} height={560}>
      <MarketRoundTracker
        roundTracker={compact(tracker)}
        game={game}
        config={cfg}
      />
    </SizedSvg>
  );
};
