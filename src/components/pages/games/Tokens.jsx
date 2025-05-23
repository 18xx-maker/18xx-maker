import { useNavigate } from "react-router";

import { addIndex, chain, is, map, splitEvery } from "ramda";

import PageSetup from "@/components/PageSetup";
import Svg from "@/components/Svg";
import CompanyToken from "@/components/tokens/CompanyToken";
import Token from "@/components/tokens/Token";
import ColorContext from "@/context/ColorContext";
import { useConfig, useGame } from "@/hooks";
import { unitsToCss } from "@/util";
import { compileCompanies, overrideCompanies } from "@/util/companies";

// Takes in a game object, a tokens config object and a paper config object.
//
// Returns data that's needed to layout a token sheet.
const getTokenData = (game, tokens, paper) => {
  let { marketTokenSize, stationTokenSize, generalTokenSize, bleed } = tokens;

  // Extra token counts from config
  let marketTokens = game.info.marketTokens || 3;
  let extraStationTokens = game.info.extraStationTokens || 0;

  // Layout
  let layout = tokens.layout;

  // Width
  let width = Math.max(marketTokenSize, stationTokenSize, generalTokenSize);

  if (layout === "gsp") {
    width = marketTokenSize = stationTokenSize = generalTokenSize = 50;
  }

  // Bleed
  let bleedWidth = bleed ? 5 : 0;
  let totalWidth = width + 2 * bleedWidth;

  // Paper setup
  let usableWidth = paper.width - 2 * paper.margins;
  let usableHeight = paper.height - 2 * paper.margins;

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

  let rowWidth = perRow * offsetX - (offsetX - totalWidth);
  let columnHeight = perColumn * offsetY - (offsetY - totalWidth);
  let extraX = (usableWidth - rowWidth) / 2;
  let extraY = (usableHeight - columnHeight) / 2;

  let getX = (i) =>
    extraX + ((i % perPage) % perRow) * offsetX + 0.5 * totalWidth;
  let getY = (i) =>
    extraY + Math.floor((i % perPage) / perRow) * offsetY + 0.5 * totalWidth;

  const perPageCalculations = perRow * perColumn;
  let perPage = perPageCalculations > 1 ? perPageCalculations : 1;

  return {
    tokens, // Config object
    marketTokens,
    extraStationTokens,
    width,
    totalWidth,
    marketTokenSize,
    stationTokenSize,
    generalTokenSize,
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
    getY,
  };
};

const TokenLayout = ({ companies, data, game }) => {
  let companyTokens = chain((company) => {
    let numberMarketTokens = data.marketTokens;
    if (is(Number, company.marketTokens)) {
      numberMarketTokens = company.marketTokens;
    }

    // Market tokens
    let marketTokens = Array(numberMarketTokens).fill(
      <CompanyToken
        company={company}
        width={data.marketTokenSize / 2}
        bleed={data.bleed}
      />,
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
    if (numberMarketTokens === 0) {
      numberReverseMarketTokens = 0;
    }

    let reverseMarketTokens = Array(numberReverseMarketTokens).fill(
      <CompanyToken
        company={company}
        width={data.marketTokenSize / 2}
        bleed={data.bleed}
        inverse={true}
      />,
    );

    let numberExtraStationTokens = 0;
    if (is(Number, company.extraStationTokens)) {
      numberExtraStationTokens = company.extraStationTokens;
    } else if (is(Number, data.extraStationTokens)) {
      numberExtraStationTokens = data.extraStationTokens;
    }

    let stationTokens = Array(
      (company.tokens || []).length + numberExtraStationTokens,
    ).fill(
      <CompanyToken
        company={company}
        width={data.stationTokenSize / 2}
        bleed={data.bleed}
      />,
    );

    return [...marketTokens, ...reverseMarketTokens, ...stationTokens];
  }, companies || []);

  let gameTokens = chain((token) => {
    let count =
      token.print != null
        ? token.print
        : token.quantity != null
          ? token.quantity
          : 1;
    let tokenWidth = token.width || data.generalTokenSize / 2;
    if (is(Object, token)) {
      return Array(count).fill(
        <Token bleed={true} outline="black" {...token} width={tokenWidth} />,
      );
    } else {
      return [
        <Token
          key={token}
          bleed={true}
          outline="black"
          color="white"
          label={token}
          width={tokenWidth}
        />,
      ];
    }
  }, game.tokens || []);

  // Combine all tokens
  let tokens = [...companyTokens, ...gameTokens];

  let nodes = addIndex(map)(
    (token, index) => (
      <g
        key={`token-${index}`}
        transform={`translate(${data.getX(index)} ${data.getY(index)})`}
      >
        {token}
      </g>
    ),
    tokens,
  );

  let pageNodes = splitEvery(data.perPage, nodes);

  return addIndex(map)(
    (nodes, i) => (
      <div
        key={`tokens-page-${i}`}
        className="tokens"
        data-testid={`game-${game.meta.slug}-tokens`}
        style={{
          width: unitsToCss(data.usableWidth),
          height: unitsToCss(data.usableHeight),
        }}
      >
        <ColorContext.Provider value="companies">
          <Svg
            viewBox={`0 0 ${data.usableWidth} ${data.usableHeight}`}
            style={{
              width: unitsToCss(data.usableWidth),
              height: unitsToCss(data.usableHeight),
            }}
          >
            {nodes}
          </Svg>
          <PageSetup paper={data.paper} landscape={false} />
        </ColorContext.Provider>
      </div>
    ),
    pageNodes,
  );
};

const Tokens = () => {
  const navigate = useNavigate();
  const { config } = useConfig();
  const game = useGame();

  if (!game.companies && !game.tokens) {
    navigate(`/games/${game.meta.slug}/`);
  }

  const { overrideCompanies: override, overrideSelect: selection } = config;
  const companies = overrideCompanies(
    compileCompanies(game),
    override,
    selection,
  );

  const data = getTokenData(game, config.tokens, config.paper);

  return <TokenLayout companies={companies} data={data} game={game} />;
};

export default Tokens;
