import React from "react";
import { Redirect } from "react-router-dom";

import Par from "./Par";
import Svg from "../Svg";

import { getParData } from "./util";
import { unitsToCss } from "../util";

const ParSingle = ({ config, game }) => {
  if (!game.stock || !game.stock.par || !game.stock.par.values) {
    return <Redirect to={`/games/${game.slug}/`} />;
  }
  let data = getParData(game.stock, config);

  let paperWidth = data.totalWidth + 5 + (2 * config.paper.margins);
  let paperHeight = data.totalHeight + 5 + (2 * config.paper.margins);
  let cssPaperWidth = unitsToCss(paperWidth);
  let cssPaperHeight = unitsToCss(paperHeight);

  return (
    <div className="printElement" style={{display:'inline-block'}}>
      <div className="stock" style={{display:'inline-block'}}>
        <Svg
          width={data.css.totalWidth}
          height={data.css.totalHeight}
          viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}>
          <Par data={data}
               title={`${game.info.title} Par`} />
        </Svg>
        <style>{`@media print {@page {size: ${cssPaperWidth} ${cssPaperHeight}; margin: ${unitsToCss(config.paper.margins)}}}`}</style>
      </div>
    </div>
  );
};

export default ParSingle;
