import React from "react";
import { Redirect, useParams } from "react-router-dom";

import Par from "./Par";
import Config from "../data/Config";
import Svg from "../Svg";

import { getParData } from "./util";

const ParSingle = () => {
  let params = useParams();
  return (
    <Config>
      {(config, game) => {

        if (!game.stock || !game.stock.par || !game.stock.par.values) {
          return <Redirect to={`/${params.game}/background`} />;
        }
        let data = getParData(game.stock, config);

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
                <Par data={data} title={`${game.info.title} Par`} />
              </Svg>
              <style>{`@media print {@page {size: ${data.css.printWidth} ${data.css.printHeight};}}`}</style>
            </div>
          </React.Fragment>
        );
      }}
    </Config>
  );
};

export default ParSingle;
