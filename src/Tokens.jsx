import React from "react";
import { Redirect } from "react-router-dom";

import Token from "./Token";
import games from "./data/games";
import * as R from "ramda";
import ColorContext from "./context/ColorContext";

import Config from "./data/Config";

import { unitsToCss } from "./util";

import is from "ramda/src/is";

import PageSetup from "./PageSetup";
import Svg from "./Svg";

const MaxTokens = ({ game }) => {
  let companies = game.companies;
  let minorCompanies = game.minorCompanies || [];
  let tokensWidth = 12;

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
        <PageSetup landscape={false}/>
      </ColorContext.Provider>
    </div>
  );
};

const GspTokens = ({ game }) => {
  let companies = game.companies;

  if (!companies) {
    return null;
  }

  let perRow = 12;
  let offsetX = 50 + 14;
  let offsetY = 50 + 10;
  let extraX = (850 - (12 * 50) - (11 * 14)) / 2;
  let extraY = (1100 - (17 * 50) - (16 * 10)) / 2;
  let marginX = extraX + 25;
  let marginY = extraY + 25;

  let getX = i => marginX + ((i % perRow) * offsetX);
  let getY = i => marginY + (Math.floor(i/perRow) * offsetY);

  let extraNormals =
      (game.info.extraTokens || 3) + (game.info.extraHomeTokens || 0);
  let tokenCount = R.scan(R.add, 0, R.addIndex(R.chain)((company, index) => {
    return(company.tokens.length + extraNormals + (game.info.extraTokens || 3));
  }, companies));
  let totalTokenCount = R.reduce(R.add, 0, R.addIndex(R.chain)((company, index) => {
    return(company.tokens.length + extraNormals + (game.info.extraTokens || 3));
  }, companies));

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
        <g key={tokenIndex} transform={`translate(${getX(tokenIndex + tokenCount[index])} ${getY(tokenIndex + tokenCount[index])})`}>
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

  let extras = R.addIndex(R.map)((token, index) => {
    if(is(Object, token)) {
      return (
        <g key={index} transform={`translate(${getX(index + totalTokenCount)} ${getY(index + totalTokenCount)})`}>
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
          <g key={index} transform={`translate(${getX(index + totalTokenCount)} ${getY(index + totalTokenCount)})`}>
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
          <g key={index} transform={`translate(${getX(index + totalTokenCount)} ${getY(index + totalTokenCount)})`}>
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

  return (
    <div className="tokens" style={{width: "8.5in", height: unitsToCss(1100 - (extraY / 2))}}>
      <ColorContext.Provider value="companies">
        <Svg viewBox={`0 0 850 ${1100 - (extraY / 2)}`} style={{width: "8.5in", height: unitsToCss(1100 - (extraY / 2))}}>
          {tokens}
        </Svg>
        <PageSetup paper={{margins: 0, width: 850, height: 1100}} landscape={false}/>
      </ColorContext.Provider>
    </div>
  );
};

const Tokens = ({ match }) => {
  let game = games[match.params.game];

  if (!game.companies) {
    return <Redirect to={`/${match.params.game}/background`} />;
  }

  return (
    <Config>
      {config => {
        if(config.tokenLayout === "gsp") {
          return <GspTokens game={game} />;
        } else {
          return <MaxTokens game={game} />;
        }
      }}
    </Config>
  );
};

export default Tokens;
