import React from "react";
import Token from "./Token";
import games from "./data/games";
import * as R from "ramda";

import Svg from "./Svg";

const Tokens = ({ match }) => {
  let game = games[match.params.game];
  let companies = game.companies;

  if (!companies) {
    return null;
  }

  let tokens = R.addIndex(R.chain)((company, index) => {
    let y = 60 * index + 30;
    let companyTokens = Array(company.tokens.length + (game.info.extraTokens || 3)).fill(
      <Token label={company.abbrev} color={company.color} width="30" />
    );
    companyTokens.push(
      <Token
        label={company.abbrev}
        color={company.color}
        width="30"
        inverse={true}
      />
    );
    let groups = R.addIndex(R.map)(
      (token, index) => (
        <g key={index} transform={`translate(${60 * index + 30} 0)`}>{token}</g>
      ),
      companyTokens
    );

    return <g key={index} transform={`translate(0 ${y})`}>{groups}</g>;
  }, companies);

  let extras = R.addIndex(R.map)((label, index) => {
    if (label.match(/^#/)) {
      return (
        <g key={index} transform={`translate(${60 * index + 30} 0)`}>
          <Token icon={label} width="30" color={"white"} outline={"black"} />
        </g>
      );
    } else {
      return (
        <g key={index} transform={`translate(${60 * index + 30} 0)`}>
          <Token label={label} width="30" color={"white"} outline={"black"} />
        </g>
      );
    }
  }, game.tokens);

  let y = 60 * companies.length + 30;
  tokens.push(<g key="extras" transform={`translate(0 ${y})`}>{extras}</g>);

  let width =
    R.reduce(R.max, 1, R.map(c => c.tokens.length + 4, companies)) * 60;
  let height = (companies.length + 1) * 60;

  return (
    <div className="tokens">
      <Svg width={width} height={height}>
        {tokens}
      </Svg>
    </div>
  );
};

export default Tokens;
