import React from "react";
import { useParams } from "react-router-dom";

import Svg from "../Svg";
import CompanyToken from "../tokens/CompanyToken";
import Token from "../tokens/Token";

import Config from "../data/Config";
import { compileCompanies, overrideCompanies } from "../util";

import addIndex from "ramda/src/addIndex";
import is from "ramda/src/is";
import map from "ramda/src/map";

import ColorContext from "../context/ColorContext";

import "./b18.scss";

import games from "../data/games";

const Tokens = () => {
  let params = useParams();
  let game = games[params.game];

  let totalHeight = 30 * ((game.companies || []).length +
                          (game.tokens || []).length);

  let companyTokenNodes = (
    <Config>
      {(config, game) => {
        return map(company => {
          return (
            <div className="token" key={company.abbrev}>
              <Svg width={30} height={30} viewBox="-26 -26 52 52">
                <CompanyToken company={company} />
              </Svg>
              <Svg width={30} height={30} viewBox="-26 -26 52 52">
                <CompanyToken company={company} inverse={true} />
              </Svg>
            </div>
          );
        }, overrideCompanies(compileCompanies(game), config.overrideCompanies, config.overrideSelection));
      }}
    </Config>
  );

  let extraTokenNodes = addIndex(map)((extraToken, index) => {
    console.log(extraToken);
    if (is(Object, extraToken)) {
      return (
        <div className="token" key={index}>
          <Svg width={30} height={30} viewBox="-26 -26 52 52">
            <Token color="white" {...extraToken} />
          </Svg>
          <Svg width={30} height={30} viewBox="-26 -26 52 52">
            <Token color="black" {...extraToken} />
          </Svg>
        </div>
      );
    } else {
      return (
        <div className="token" key={index}>
          <Svg width={30} height={30} viewBox="-26 -26 52 52">
            <Token label={extraToken} color="white" />
          </Svg>
          <Svg width={30} height={30} viewBox="-26 -26 52 52">
            <Token label={extraToken} color="black" />
          </Svg>
        </div>
      );
    }
  }, game.tokens || []);

  return (
    <ColorContext.Provider value="companies">
      <div className="b18"
           style={{width: `60px`}}>
        <div className="tokens">
          {companyTokenNodes}
          {extraTokenNodes}
        </div>
      </div>
      <style>{`@media print {@page {size: 60px ${totalHeight}px;}}`}</style>
    </ColorContext.Provider>
  );
};

export default Tokens;
