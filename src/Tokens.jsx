import React from "react";
import { connect } from "react-redux";
import { Redirect, useParams } from "react-router-dom";

import CompanyToken from "./tokens/CompanyToken";
import Token from "./tokens/Token";
import games from "./data/games";
import ColorContext from "./context/ColorContext";

import Config from "./data/Config";

import { compileCompanies, overrideCompanies, unitsToCss } from "./util";

import is from "ramda/src/is";
import chain from "ramda/src/chain";
import map from "ramda/src/map";
import addIndex from "ramda/src/addIndex";

import PageSetup from "./PageSetup";
import Svg from "./Svg";

// Takes in a game object, a tokens config object and a paper config object.
//
// Returns data that's needed to layout a token sheet.
export const getTokenData = (game, tokens, paper) => {
  let { marketTokenSize, stationTokenSize, bleed } = tokens;

  // Extra token counts from config
  let marketTokens = game.info.marketTokens || 3;
  let extraStationTokens = game.info.extraStationTokens || 0;

  // Layout
  let layout = tokens.layout;

  // Width
  let width = Math.max(marketTokenSize, stationTokenSize);

  if (layout === "gsp") {
    width = marketTokenSize = stationTokenSize = 50;
  }

  // Bleed
  let bleedWidth = bleed ? 5 : 0;
  let totalWidth = width + (2 * bleedWidth);

  // Paper setup
  let usableWidth = paper.width - (2 * paper.margins);
  let usableHeight = paper.height - (2 * paper.margins);

  // Page row and column settings
  let perRow = Math.floor(usableWidth / totalWidth);
  let perColumn = Math.floor(usableHeight / totalWidth);
  let offsetX = totalWidth;
  let offsetY = totalWidth;

  if (layout === "gsp") {
    perRow = 12;
    perColumn = 17;
    offsetX = 64;
    offsetY = 60;
  }

  let rowWidth = (perRow * offsetX) - (offsetX - totalWidth);
  let columnHeight = (perColumn * offsetY) - (offsetY - totalWidth);
  let extraX = (usableWidth - rowWidth) / 2;
  let extraY = (usableHeight - columnHeight) / 2;

  let getX = i => extraX + ((i % perRow) * offsetX) + (0.5 * totalWidth);
  let getY = i => extraY + (Math.floor(i / perRow) * offsetY) + (0.5 *  totalWidth);

  let perPage = perRow * perColumn;

  return {
    tokens, // Config object
    marketTokens,
    extraStationTokens,
    width,
    totalWidth,
    marketTokenSize,
    stationTokenSize,
    bleed,
    bleedWidth,
    layout,
    perRow,
    perColumn,
    perPage,
    rowWidth,
    columnHeight,
    extraX,
    extraY,
    paper,
    usableWidth,
    usableHeight,
    offsetX,
    offsetY,
    getX,
    getY
  };
};

const TokenLayout = ({ companies, data, game }) => {
  let companyTokens = chain(company => {
    let numberMarketTokens = company.marketTokens || data.marketTokens;

    // Market tokens
    let marketTokens = Array(numberMarketTokens).fill(
      <CompanyToken company={company}
                    width={data.marketTokenSize / 2}
                    bleed={data.bleed} />
    );

    let numberReverseMarketTokens = numberMarketTokens;
    switch (data.tokens.reverseMarketTokens) {
    case "none":
      numberReverseMarketTokens = 0;
      break;
    case "one":
      numberReverseMarketTokens = 1;
      break;
    default:
      break;
    }

    let reverseMarketTokens = Array(numberReverseMarketTokens).fill(
      <CompanyToken company={company}
                    width={data.marketTokenSize / 2}
                    bleed={data.bleed}
                    inverse={true} />
    );

    let stationTokens = Array(company.tokens.length + (company.extraStationTokens || 0) + data.extraStationTokens).fill(
      <CompanyToken company={company}
                    width={data.stationTokenSize / 2}
                    bleed={data.bleed} />
    );

    return [...marketTokens, ...reverseMarketTokens, ...stationTokens];
  }, companies);

  let gameTokens = map(token => {
    if (is(Object, token)) {
      return <Token bleed={true}
               outline="black"
               {...token}
               width={data.stationTokenSize / 2} />
    } else {
      return <Token bleed={true}
               outline="black"
               color="white"
               label={token}
               width={data.stationTokenSize / 2} />
    }
  }, game.tokens);

  // Combine all tokens
  let tokens = [...companyTokens, ...gameTokens];

  let nodes = addIndex(map)((token, index) => (
    <g
      key={`token-${index}`}
      transform={`translate(${data.getX(index)} ${data.getY(index)})`} >
      {token}
    </g>
  ), tokens);

  return (
    <div
      className="tokens"
      style={{ width: unitsToCss(data.usableWidth),
               height: unitsToCss(data.usableHeight) }}>
      <ColorContext.Provider value="companies">
        <Svg
          viewBox={`0 0 ${data.usableWidth} ${data.usableHeight}`}
          style={{ width: unitsToCss(data.usableWidth),
                   height: unitsToCss(data.usableHeight) }}>
          {nodes}
        </Svg>
        <PageSetup
          paper={data.paper}
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

  let companies = overrideCompanies(compileCompanies(game), override, selection);

  return (
    <Config>
      {config => {
        let data = getTokenData(game, config.tokens, config.paper);

        return <TokenLayout companies={companies} data={data} game={game} />;
      }}
    </Config>
  );
};

const mapStateToProps = state => ({
  override: state.config.overrideCompanies,
  selection: state.config.overrideSelection
});

export default connect(mapStateToProps)(Tokens);
