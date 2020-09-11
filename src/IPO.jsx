import React from "react";
import Config from "./data/Config";
import Color from "./util/Color";
import ColorContext from "./context/ColorContext";

import GameCompanyToken from "./tokens/GameCompanyToken";
import Svg from "./Svg";
import PageSetup from "./PageSetup";

import { compileCompanies, unitsToCss } from "./util";

import filter from "ramda/src/filter";
import is from "ramda/src/is";
import map from "ramda/src/map";

require("./IPO.scss");

const IPO = () => {
  return (
    <Config>
      {(config, game) => {
        let companies = compileCompanies(game);

        if (is(Array, game.ipo)) {
          companies = filter(company => game.ipo.includes(company.shareType), companies);
        }

        return (
          <Color context="companies">
            {c => (
              <div className="ipo"
                   style={{
                     width: unitsToCss(config.paper.width),
                     height: unitsToCss(config.paper.height),
                     margin: unitsToCss(config.paper.margins),
                   }}>
                <h2>{game.info.title} Initial Public Offering</h2>
                <div className="ipo__companies">
                  {map(
                    company => (
                      <div key={`ipo-${company.abbrev}`}
                           className="ipo__company"
                           style={{
                             borderRadius: unitsToCss(config.ipo.borderRadius),
                             width: unitsToCss(config.cards.width),
                             height: unitsToCss(config.cards.height),
                             backgroundColor: company.color ? c(company.color) : c("plain")
                           }}>
                        <div className="ipo__token"
                             style={{
                               margin: `${unitsToCss((config.cards.height - 60) / 2)} auto`
                             }}>
                          <ColorContext.Provider value="companies">
                            <Svg viewBox="-25 -25 50 50">
                              <GameCompanyToken abbrev={company.abbrev} outline="white" />
                            </Svg>
                          </ColorContext.Provider>
                        </div>
                      </div>
                    ),
                    companies
                  )}
                </div>
                <PageSetup/>
              </div>
            )}
          </Color>
        );
      }}
    </Config>
  );
};

export default IPO;
