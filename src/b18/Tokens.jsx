import React from "react";

import Svg from "../Svg";
import Token from "../Token";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

import ColorContext from "../context/ColorContext";

import "./b18.scss";

import games from "../data/games";

// const BlankToken = () => (
//   <Svg width={30} height={30} viewBox="-26 -26 52 52">
//     <Token label="" token="black" />
//   </Svg>
// );

const Tokens = ({match}) => {
  let game = games[match.params.game];

  let totalHeight = 30 * ((game.companies || []).length +
                          (game.tokens || []).length);

  let companyTokenNodes = map(company => {
    return (
      <div className="token" key={company.abbrev}>
        <Svg width={30} height={30} viewBox="-26 -26 52 52">
          <Token label={company.abbrev}
                 token={company.token || company.color} />
        </Svg>
        <Svg width={30} height={30} viewBox="-26 -26 52 52">
          <Token label={company.abbrev}
                 inverse={true}
                 token={company.token || company.color} />
        </Svg>
      </div>
    );
  }, game.companies || []);

  let extraTokenNodes = addIndex(map)((extraToken, index) => {
    if (extraToken.match(/^#/)) {
      return (
        <div className="token" key={index}>
          <Svg width={30} height={30} viewBox="-26 -26 52 52">
            <Token icon={extraToken} token="white" />
          </Svg>
          <Svg width={30} height={30} viewBox="-26 -26 52 52">
            <Token icon={extraToken} token="black" />
          </Svg>
        </div>
      );
    } else {
      return (
        <div className="token" key={index}>
          <Svg width={30} height={30} viewBox="-26 -26 52 52">
            <Token label={extraToken} token="white" />
          </Svg>
          <Svg width={30} height={30} viewBox="-26 -26 52 52">
            <Token label={extraToken} token="black" />
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
