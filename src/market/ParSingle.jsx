import React from "react";
import { Redirect, useParams } from "react-router-dom";

import Par from "./Par";
import Svg from "../Svg";

import { getParData } from "./util";

const ParSingle = ({ config, game }) => {
  if (!game.stock || !game.stock.par || !game.stock.par.values) {
    return <Redirect to={`/games/${game.slug}/`} />;
  }
  let data = getParData(game.stock, config);

  return (
    <React.Fragment>
      <div className="stock">
        <Svg
          width={data.css.totalWidth}
          height={data.css.totalHeight}
          viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}>
          <Par data={data}
               title={`${game.info.title} Par`} />
        </Svg>
        <style>{`@media print {@page {size: ${data.css.printWidth} ${data.css.printHeight};}}`}</style>
      </div>
    </React.Fragment>
  );
};

export default ParSingle;
