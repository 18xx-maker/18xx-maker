import React from "react";
import Token from "./Token";
import games from "./data/games";
import { colors, textColor } from "./data";
import * as R from "ramda";

const Tokens = ({ match }) => {
  let game = games[match.params.game];
  let companies = game.companies;

  let tokens = R.addIndex(R.chain)((company, index) => {
    let y = 60 * index + 30;
    let companyTokens = Array(company.tokens.length + 3).fill(
      <Token
        label={company.abbrev}
        color={company.color}
        labelColor={company.textColor}
      />
    );
    companyTokens.push(
      <Token
        label={company.abbrev}
        color={company.color}
        labelColor={company.textColor}
        inverse={true}
      />
    );
    let groups = R.addIndex(R.map)(
      (token, index) => (
        <g transform={`translate(${60 * index + 30} 0)`}>{token}</g>
      ),
      companyTokens
    );

    return <g transform={`translate(0 ${y})`}>{groups}</g>;
  }, companies);

  let extras = R.addIndex(R.map)((label, index) => {
    return (
      <g transform={`translate(${60 * index + 30} 0)`}>
        <Token label={label} color={colors["track"]} inverse={true} />
      </g>
    );
  }, game.tokens);

  let y = 60 * companies.length + 30;
  tokens.push(<g transform={`translate(0 ${y})`}>{extras}</g>);

  return (
    <svg width="800" height="1000">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css?family=Bitter:700');
        </style>
      </defs>
      {tokens}
    </svg>
  );
};

export default Tokens;
