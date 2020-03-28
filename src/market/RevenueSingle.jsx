import React from "react";

import Config from "../data/Config";
import Svg from "../Svg";

import { getRevenueData } from "./util";

import Revenue from "./Revenue";

const RevenueSingle = () => {
  return (
    <Config>
      {(config, game) => {
        let data = getRevenueData(game.revenue, config);

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
                <Revenue data={data} title={game.info.title} />
              </Svg>
              <style>{`@media print {@page {size: ${data.css.printWidth} ${data.css.printHeight};}}`}</style>
            </div>
          </React.Fragment>
        );
      }}
    </Config>
  );
};

export default RevenueSingle;
