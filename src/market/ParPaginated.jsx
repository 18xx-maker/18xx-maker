import React from "react";
import { Redirect, useParams } from "react-router-dom";

import Par from "./Par";
import Config from "../data/Config";
import Svg from "../Svg";
import PageSetup from "../PageSetup";

import map from "ramda/src/map";

import { getParData } from "./util";

const ParPaginated = () => {
  let params = useParams();
  return (
    <Config>
      {(config, game) => {

        if (!game.stock || !game.stock.par) {
          return <Redirect to={`/${params.game}/background`} />;
        }
        let data = getParData(game.stock, config.stock, config.paper, config.pagination);

        if (data.pages === 1) {
          return <Redirect to={`/${params.game}/par`} />;
        }

        let y = -25; // Start with room for margins
        let parPages = map(height => {
          let x = -25; // Start with room for margins
          let pages = map(width => {
            let page = (
              <div
                key={`page-${x}-${y}`}
                className="cutlines"
                style={{
                  width: `${(width + 25) / 100}in`,
                  height: `${(height + 25) / 100}in`,
                  float: "none",
                  margin: "auto auto",
                  boxSizing: "content-box"
                }}
              >
                <div className="MapPage">
                  <svg
                    style={{
                      width: `${(width + 25) / 100}in`,
                      height: `${(height + 25) / 100}in`
                    }}
                    viewBox={`${x - 12.5} ${y - 12.5} ${width + 25} ${height + 25}`}
                  >
                    <use href={`#${game.info.abbrev || game.info.title}_par`} />
                  </svg>
                </div>
              </div>
            );

            x = x + width;
            return page;
          }, data.splitPages(data.totalWidth + 50, data.usableWidth));

          y = y + height;
          return pages;
        }, data.splitPages(data.totalHeight + 50, data.usableHeight));

        let defs = (
          <g id={`${game.info.abbrev || game.info.title}_par`}>
            <Par data={data} title={game.info.title} />
          </g>
        );

        return (
          <React.Fragment>
            <div className="PrintNotes">
              <div>
                <p>These Pars are meant to be printed in <b>{data.landscape ? "landscape" : "portrait"}</b> mode</p>
              </div>
            </div>
            <Svg className="FullPar" defs={defs} />
            {parPages}
            <PageSetup landscape={data.landscape} />
          </React.Fragment>
        );
      }}
    </Config>
  );
};

export default ParPaginated;
