import React from "react";
import { Redirect } from "react-router-dom";

import Svg from "../Svg";

import { getMarketData } from "./util";
import { unitsToCss } from "../util";

import Market from "./Market";

const MarketSingle = ({ config, game }) => {
  if (!game.stock || !game.stock.market) {
    return <Redirect to={`/games/${game.slug}/`} />;
  }

  let data = getMarketData(game.stock, config);
  let paperWidth = unitsToCss(data.totalWidth + 5 + (2 * config.paper.margins));
  let paperHeight = unitsToCss(data.totalHeight + 5 + (2 * config.paper.margins));

  return (
    <React.Fragment>
      <div className="stock">
        <Svg
          width={data.css.totalWidth}
          height={data.css.totalHeight}
          viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}>
          <Market data={data}
                  game={game}
                  config={config}
                  title={game.info.title} />
        </Svg>
        <style>{`@media print {@page {size: ${paperWidth} ${paperHeight}; margin: ${unitsToCss(config.paper.margins)}}}`}</style>
      </div>
    </React.Fragment>
  );
};

export default MarketSingle;
