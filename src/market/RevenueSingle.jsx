import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";
import GameContext from "../context/GameContext";

import Svg from "../Svg";

import { getRevenueData } from "./util";

import Revenue from "./Revenue";

const RevenueSingle = () => {
  const { config } = useContext(ConfigContext);
  const { game } = useContext(GameContext);
  let data = getRevenueData(game.revenue, config);

  return (
    <React.Fragment>
      <div className="stock">
        <Svg
          width={data.css.totalWidth}
          height={data.css.totalHeight}
          viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}>
          <Revenue data={data}
                   config={config}
                   game={game}/>
        </Svg>
        <style>{`@media print {@page {size: ${data.css.printWidth} ${data.css.printHeight};}}`}</style>
      </div>
    </React.Fragment>
  );
};

export default RevenueSingle;
