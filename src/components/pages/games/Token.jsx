import { useParams } from "react-router";

import { addIndex, compose, concat, is, map, propEq, reject } from "ramda";

import Editor from "@/components/Editor";
import CompanyToken from "@/components/tokens/CompanyToken";
import Token from "@/components/tokens/Token";

import ColorContext from "@/context/ColorContext";
import { useConfig, useGame } from "@/hooks";
import { compileCompanies, overrideCompanies } from "@/util/companies.js";
import { getTokenGrid } from "@/util/sizes";

const TokenSingle = () => {
  const { config } = useConfig();
  const game = useGame();
  const { index } = useParams();

  let grid = getTokenGrid(config.tokens);

  const { marketTokenSize, stationTokenSize, generalTokenSize } = config.tokens;

  // Every variant of a token is one grid cell, centered, in a single row
  const row = (tokens) => ({
    count: tokens.length,
    node: addIndex(map)(
      (token, i) => (
        <g key={i} transform={`translate(${(i + 0.5) * grid} ${grid / 2})`}>
          {token}
        </g>
      ),
      tokens,
    ),
  });

  let companyTokenNodes = map(
    (company) =>
      row([
        <CompanyToken
          width={marketTokenSize / 2}
          company={company}
          key="market"
        />,
        <CompanyToken
          width={marketTokenSize / 2}
          company={company}
          inverse={true}
          key="marketInverse"
        />,
        <CompanyToken
          width={stationTokenSize / 2}
          company={company}
          key="station"
        />,
        <CompanyToken
          width={stationTokenSize / 2}
          company={company}
          inverse={true}
          key="stationInverse"
        />,
      ]),
    overrideCompanies(
      compileCompanies(game),
      config.overrideCompanies,
      config.overrideSelection,
    ),
  );

  // "quantity" of 0 means remove the token entirely from the array
  let extraTokenNodes = compose(
    map((extraToken) => {
      const props = is(Object, extraToken) ? extraToken : { label: extraToken };
      return row([
        <Token
          width={generalTokenSize / 2}
          color="white"
          {...props}
          key="white"
        />,
        <Token
          width={generalTokenSize / 2}
          color="black"
          {...props}
          key="black"
        />,
      ]);
    }),
    reject(propEq(0, "quantity")),
  )(game.tokens || []);

  let tokenNode = concat(companyTokenNodes, extraTokenNodes)[index];

  return (
    <div
      className="token printElement"
      data-testid={`game-${game.meta.slug}-token`}
    >
      <ColorContext.Provider value="companies">
        {tokenNode && (
          <Editor
            className="printElement"
            width={tokenNode.count * grid}
            height={grid}
          >
            {tokenNode.node}
          </Editor>
        )}
      </ColorContext.Provider>
    </div>
  );
};

export default TokenSingle;
