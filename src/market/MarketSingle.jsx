import React from "react";
import { Redirect, useParams } from "react-router-dom";

import Config from "../data/Config";
import Svg from "../Svg";

import { getMarketData } from "./util";

import Market from "./Market";

const MarketSingle = () => {
  let params = useParams();

  return (
    <Config>
      {(config, game) => {

        if (!game.stock || !game.stock.market) {
          return <Redirect to={`/${params.game}/background`} />;
        }

        let data = getMarketData(game.stock, config.stock, config.paper, config.pagination);

        return (
          <React.Fragment>
            <div className="PrintNotes">
              <div>
                <h3>Width: {data.humanWidth}</h3>
                <h3>Height: {data.humanHeight}</h3>
              </div>
            </div>
            <div className="stock">
              <Svg
                width={data.css.totalWidth}
                height={data.css.totalHeight}
                viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}>
                <Market data={data} title={game.info.title} />
              </Svg>
              <style>{`@media print {@page {size: ${data.css.printWidth} ${data.css.printHeight};}}`}</style>
            </div>
          </React.Fragment>
        );
      }}
    </Config>
  );
};

export default MarketSingle;
