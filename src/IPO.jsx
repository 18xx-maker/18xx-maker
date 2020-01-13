import React from "react";
import Config from "./data/Config";
import Color from "./data/Color";
import ColorContext from "./context/ColorContext";

import GameCompanyToken from "./tokens/GameCompanyToken";
import Svg from "./Svg";
import PageSetup from "./PageSetup";

import Par from "./Par";

import { compileCompanies } from "./util";

import filter from "ramda/src/filter";
import is from "ramda/src/is";
import map from "ramda/src/map";

require("./IPO.css");

const IPO = () => {
  return (
    <Config>
      {(config, game) => {
        let companies = compileCompanies(game);

        console.log(companies, game.ipo);
        if (is(Array, game.ipo)) {
          companies = filter(company => game.ipo.includes(company.shareType), companies);
        }

        return (
          <Color>
            {c => (
              <div className="ipo">
                <h2>{game.info.title} IPO</h2>
                <div className="ipo__companies">
                  {map(
                    company => (
                      <div key={`ipo-${company.abbrev}`} className="ipo__company" style={{borderRadius: config.ipo.borderRadius, backgroundColor: c("plain")}}>
                        <div className="ipo__token">
                          <ColorContext.Provider value="companies">
                            <Svg viewBox="-25 -25 50 50">
                              <GameCompanyToken abbrev={company.abbrev} />
                            </Svg>
                          </ColorContext.Provider>
                        </div>
                      </div>
                    ),
                    companies
                  )}
                </div>
                <Par par={game.stock.par} legend={game.stock.legend || []} />
                <PageSetup landscape={true}/>
              </div>
            )}
          </Color>
        );
      }}
    </Config>
  );
};

export default IPO;
