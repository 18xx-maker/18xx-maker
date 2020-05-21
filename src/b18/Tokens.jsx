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
import compose from "ramda/src/compose";
import reject from "ramda/src/reject";
import propEq from "ramda/src/propEq";

import ColorContext from "../context/ColorContext";

import "./b18.scss";

import games from "../data/games";

const Tokens = () => {
  let params = useParams();
  let game = games[params.game];

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

  // "quantity" of 0 means remove the token entirely from the array
  let extraTokenNodes = compose(
    addIndex(map)((extraToken, index) => {
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
    }),
    reject(propEq("quantity", 0))
  )(game.tokens || []);

  let totalHeight = 30 * (companyTokenNodes.length + extraTokenNodes.length);

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
