import React from "react";
import Token from "./Token";
import games from "./data/games";
import * as R from "ramda";
import ColorContext from "./context/ColorContext";

import is from "ramda/src/is";

import Svg from "./Svg";

const Tokens = ({ match }) => {
  let game = games[match.params.game];
  let companies = game.companies;
  let minorCompanies = game.minorCompanies || [];
  let tokensWidth = 12;

  if (!companies) {
    return null;
  }

  let extraNormals =
      (game.info.extraTokens || 3) + (game.info.extraHomeTokens || 0);
  let extraMinors = (game.info.extraMinors || 0);
  let tokenCount = R.scan(R.add, 0, R.addIndex(R.chain)((company, index) => {
    return(company.tokens.length + extraNormals + (game.info.extraTokens || 3));
  }, companies));
  let totalTokenCount = R.reduce(R.add, 0, R.addIndex(R.chain)((company, index) => {
    return(company.tokens.length + extraNormals + (game.info.extraTokens || 3));
  }, companies));
  let minorTokenCount = R.scan(R.add, 0, R.addIndex(R.chain)((minors, index) => {
    return(minors.tokens.length + extraMinors);
  }, minorCompanies));
  let totalMinorTokenCount = R.reduce(R.add, 0, R.addIndex(R.chain)((minor, index) => {
    return(minor.tokens.length + extraMinors);
  }, minorCompanies));
  let gameTokenCount = game.tokens.length;

  let tokens = R.addIndex(R.chain)((company, index) => {
    let companyTokens = Array(company.tokens.length + extraNormals).fill(
      <Token
        label={company.abbrev}
        token={company.token || company.color}
        bleed={true}
      />
    );
    R.times(() => {
      companyTokens.push(
        <Token
          label={company.abbrev}
          token={company.token || company.color}
          bleed={true}
          inverse={true}
        />
      );
    }, game.info.extraTokens || 3);

    let groups = R.addIndex(R.map)(
      (token, tokenIndex) => (
        <g key={tokenIndex} transform={`translate(${(60 * (tokenIndex + tokenCount[index]) + 30)%(60 * tokensWidth)} ${30 + (60 * Math.floor(((tokenIndex + tokenCount[index]))/tokensWidth))})`}>
          {token}
        </g>
      ),
      companyTokens
    );
    return (
      <g key={index} >
        {groups}
      </g>
    );
  }, companies);

  let minorTokens = R.addIndex(R.chain)((minorCompany, index) => {
    let minorCompanyTokens = Array(minorCompany.tokens.length + extraMinors).fill(
      <Token
        label={minorCompany.abbrev}
        token={minorCompany.token || minorCompany.color}
        bleed={true}
        outline="black"
      />
    );
    R.times(() => {
      minorCompanyTokens.push(
        <Token
          label={minorCompany.abbrev}
          token={minorCompany.token || minorCompany.color}
          bleed={true}
          outline="black"
        />
      );
    }, extraMinors);

    let groups = R.addIndex(R.map)(
      (token, tokenIndex) => (
        <g key={tokenIndex} transform={`translate(${(60 * (tokenIndex + minorTokenCount[index] + totalTokenCount) + 30)%(60 * tokensWidth)} ${30 + (60 * Math.floor(((tokenIndex + minorTokenCount[index] + totalTokenCount))/tokensWidth))})`}>
          {token}
        </g>
      ),
      minorCompanyTokens
    );

    return (
      <g key={index}>
        {groups}
      </g>
    );
  }, minorCompanies);

  tokens.push(
    <g key="minorTokens">
      {minorTokens}
    </g>
  );

  let extras = R.addIndex(R.map)((token, index) => {
    if(is(Object, token)) {
      return (
        <g key={index} transform={`translate(${(60 * (index + totalMinorTokenCount + totalTokenCount) + 30)%(60 * tokensWidth)} ${30 + (60 * Math.floor(((index + totalMinorTokenCount + totalTokenCount))/tokensWidth))})`}>
          <Token
            bleed={true}
            outline="black"
            {...token}
          />
        </g>
      );
    } else {
      if (token.match(/^#/)) {
        return (
          <g key={index} transform={`translate(${(60 * (index + totalMinorTokenCount + totalTokenCount) + 30)%(60 * tokensWidth)} ${30 + (60 * Math.floor(((index + totalMinorTokenCount + totalTokenCount))/tokensWidth))})`}>
            <Token
              icon={token}
              bleed={true}
              token="white"
              outline="black"
            />
          </g>
        );
      } else {
        return (
          <g key={index} transform={`translate(${(60 * (index + totalMinorTokenCount + totalTokenCount) + 30)%(60 * tokensWidth)} ${30 + (60 * Math.floor(((index + totalMinorTokenCount + totalTokenCount))/tokensWidth))})`}>
            <Token
              label={token}
              bleed={true}
              token="white"
              outline="black"
            />
          </g>
        );
      }
    }
  }, game.tokens);

  tokens.push(
    <g key="extras">
      {extras}
    </g>
  );


  let width = 60 * tokensWidth;
  let height = 60 * Math.ceil(((gameTokenCount + totalMinorTokenCount + totalTokenCount))/tokensWidth);

  return (
    <div className="tokens">
      <ColorContext.Provider value="companies">
        <Svg width={width} height={height}>
          {tokens}
        </Svg>
        <style>{`@media print {@page {size: 8.5in 11in;}}`}</style>
      </ColorContext.Provider>
    </div>
  );
};

export default Tokens;
