import React from "react";
import { connect } from "react-redux";
import { Redirect, useParams } from "react-router-dom";

import CompanyToken from "./tokens/CompanyToken";
import Token from "./tokens/Token";
import games from "./data/games";
import * as R from "ramda";
import ColorContext from "./context/ColorContext";

import Config from "./data/Config";

import { compileCompanies, overrideCompanies, unitsToCss } from "./util";

import is from "ramda/src/is";

import PageSetup from "./PageSetup";
import Svg from "./Svg";

const MaxTokens = ({ game, override, selection }) => {
  let companies = overrideCompanies(compileCompanies(game), override, selection);
  let tokensWidth = 12;

  let extraNormals =
    (game.info.marketTokens || 3) + (game.info.extraStationTokens || 0);
  let tokenCount = R.scan(
    R.add,
    0,
    R.addIndex(R.chain)((company, index) => {
      return (
        company.tokens.length + extraNormals + (game.info.marketTokens || 3)
      );
    }, companies)
  );
  let totalTokenCount = R.reduce(
    R.add,
    0,
    R.addIndex(R.chain)((company, index) => {
      return (
        company.tokens.length + extraNormals + (game.info.marketTokens || 3)
      );
    }, companies)
  );
  let gameTokenCount = game.tokens.length;

  let tokens = R.addIndex(R.chain)((company, index) => {
    let companyTokens = Array(company.tokens.length + extraNormals).fill(
      <CompanyToken company={company} bleed={true} />
    );
    R.times(() => {
      companyTokens.push(
        <CompanyToken company={company} bleed={true} inverse={true} />
      );
    }, game.info.marketTokens || 3);

    let groups = R.addIndex(R.map)(
      (token, tokenIndex) => (
        <g
          key={tokenIndex}
          transform={`translate(${(60 * (tokenIndex + tokenCount[index]) + 30) %
            (60 * tokensWidth)} ${30 +
            60 * Math.floor((tokenIndex + tokenCount[index]) / tokensWidth)})`}
        >
          {token}
        </g>
      ),
      companyTokens
    );
    return <g key={index}>{groups}</g>;
  }, companies);

  let extras = R.addIndex(R.map)((token, index) => {
    if (is(Object, token)) {
      return (
        <g
          key={index}
          transform={`translate(${(60 * (index + totalTokenCount) + 30) %
            (60 * tokensWidth)} ${30 +
            60 * Math.floor((index + totalTokenCount) / tokensWidth)})`}
        >
          <Token bleed={true} outline="black" {...token} />
        </g>
      );
    } else {
      if (token.match(/^#/)) {
        return (
          <g
            key={index}
            transform={`translate(${(60 * (index + totalTokenCount) + 30) %
              (60 * tokensWidth)} ${30 +
              60 * Math.floor((index + totalTokenCount) / tokensWidth)})`}
          >
            <Token icon={token} bleed={true} color="white" outline="black" />
          </g>
        );
      } else {
        return (
          <g
            key={index}
            transform={`translate(${(60 * (index + totalTokenCount) + 30) %
              (60 * tokensWidth)} ${30 +
              60 * Math.floor((index + totalTokenCount) / tokensWidth)})`}
          >
            <Token label={token} bleed={true} color="white" outline="black" />
          </g>
        );
      }
    }
  }, game.tokens);

  tokens.push(<g key="extras">{extras}</g>);

  let width = 60 * tokensWidth;
  let height = 60 * Math.ceil((gameTokenCount + totalTokenCount) / tokensWidth);

  return (
    <div className="tokens">
      <ColorContext.Provider value="companies">
        <Svg width={width} height={height}>
          {tokens}
        </Svg>
        <PageSetup landscape={false} />
      </ColorContext.Provider>
    </div>
  );
};

const GspTokens = ({ game, override, selection }) => {
  let companies = overrideCompanies(compileCompanies(game), override, selection);

  if (!companies) {
    return null;
  }

  let perRow = 12;
  let offsetX = 50 + 14;
  let offsetY = 50 + 10;
  let extraX = (850 - 12 * 50 - 11 * 14) / 2;
  let extraY = (1100 - 17 * 50 - 16 * 10) / 2;
  let marginX = extraX + 25;
  let marginY = extraY + 25;

  let getX = i => marginX + (i % perRow) * offsetX;
  let getY = i => marginY + Math.floor(i / perRow) * offsetY;

  let extraNormals =
    (game.info.marketTokens || 3) + (game.info.extraStationTokens || 0);
  let tokenCount = R.scan(
    R.add,
    0,
    R.addIndex(R.chain)((company, index) => {
      return (
        company.tokens.length + extraNormals + (game.info.marketTokens || 3)
      );
    }, companies)
  );
  let totalTokenCount = R.reduce(
    R.add,
    0,
    R.addIndex(R.chain)((company, index) => {
      return (
        company.tokens.length + extraNormals + (game.info.marketTokens || 3)
      );
    }, companies)
  );

  let tokens = R.addIndex(R.chain)((company, index) => {
    let companyTokens = Array(company.tokens.length + extraNormals).fill(
      <CompanyToken company={company} bleed={true} />
    );
    R.times(() => {
      companyTokens.push(
        <CompanyToken company={company} bleed={true} inverse={true} />
      );
    }, game.info.marketTokens || 3);

    let groups = R.addIndex(R.map)(
      (token, tokenIndex) => (
        <g
          key={tokenIndex}
          transform={`translate(${getX(tokenIndex + tokenCount[index])} ${getY(
            tokenIndex + tokenCount[index]
          )})`}
        >
          {token}
        </g>
      ),
      companyTokens
    );
    return <g key={index}>{groups}</g>;
  }, companies);

  let extras = R.addIndex(R.map)((token, index) => {
    if (is(Object, token)) {
      return (
        <g
          key={index}
          transform={`translate(${getX(index + totalTokenCount)} ${getY(
            index + totalTokenCount
          )})`}
        >
          <Token bleed={true} outline="black" {...token} />
        </g>
      );
    } else {
      if (token.match(/^#/)) {
        return (
          <g
            key={index}
            transform={`translate(${getX(index + totalTokenCount)} ${getY(
              index + totalTokenCount
            )})`}
          >
            <Token icon={token} bleed={true} color="white" outline="black" />
          </g>
        );
      } else {
        return (
          <g
            key={index}
            transform={`translate(${getX(index + totalTokenCount)} ${getY(
              index + totalTokenCount
            )})`}
          >
            <Token label={token} bleed={true} color="white" outline="black" />
          </g>
        );
      }
    }
  }, game.tokens);

  tokens.push(<g key="extras">{extras}</g>);

  return (
    <div
      className="tokens"
      style={{ width: "8.5in", height: unitsToCss(1100 - extraY / 2) }}
    >
      <ColorContext.Provider value="companies">
        <Svg
          viewBox={`0 0 850 ${1100 - extraY / 2}`}
          style={{ width: "8.5in", height: unitsToCss(1100 - extraY / 2) }}
        >
          {tokens}
        </Svg>
        <PageSetup
          paper={{ margins: 0, width: 850, height: 1100 }}
          landscape={false}
        />
      </ColorContext.Provider>
    </div>
  );
};

const Tokens = ({ override, selection }) => {
  let params = useParams();
  let game = games[params.game];

  if (!game.companies) {
    return <Redirect to={`/${params.game}/background`} />;
  }

  return (
    <Config>
      {config => {
        if (config.tokenLayout === "gsp") {
          return (
            <GspTokens game={game} override={override} selection={selection} />
          );
        } else {
          return (
            <MaxTokens game={game} override={override} selection={selection} />
          );
        }
      }}
    </Config>
  );
};

const mapStateToProps = state => ({
  override: state.config.overrideCompanies,
  selection: state.config.overrideSelection
});

export default connect(mapStateToProps)(Tokens);
