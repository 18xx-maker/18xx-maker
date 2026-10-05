import { useParams } from "react-router";

import { addIndex, compose, concat, is, map, propEq, reject } from "ramda";

import HtmlEditor from "@/components/editor/HtmlEditor";
import Svg from "@/components/svg/Svg";
import CompanyToken from "@/components/tokens/CompanyToken";
import Token from "@/components/tokens/Token";

import ColorContext from "@/context/ColorContext";
import { useConfig, useGame } from "@/hooks";
import {
  compileCompanies,
  overrideCompanies,
} from "@/util/companies/companies.js";
import { getTokenGrid } from "@/util/sizes";

// A square svg for a token of the given size, padded to the size of the grid
const TokenSvg = ({ size, grid, children }) => (
  <Svg
    viewBox={`-${size / 2} -${size / 2} ${size} ${size}`}
    style={{
      width: `${size / 100}in`,
      height: `${size / 100}in`,
      padding: `${(grid - size) / 200.0}in`,
    }}
  >
    {children}
  </Svg>
);

const TokenBox = ({ grid, children }) => (
  <div className="token">
    <div
      className="printElement"
      style={{ height: `${grid / 100.0}in`, display: "inline-block" }}
    >
      {children}
    </div>
  </div>
);

const TokenPage = () => {
  const { config } = useConfig();
  const game = useGame();
  const { index } = useParams();

  let grid = getTokenGrid(config.tokens);

  const { marketTokenSize, stationTokenSize, generalTokenSize } = config.tokens;

  const box = (key, children) => (
    <TokenBox key={key} grid={grid}>
      {children}
    </TokenBox>
  );

  const pair = (name, size, first, second) => [
    <TokenSvg key={`${name}-first`} size={size} grid={grid}>
      {first}
    </TokenSvg>,
    <TokenSvg key={`${name}-second`} size={size} grid={grid}>
      {second}
    </TokenSvg>,
  ];

  let companyTokenNodes = map(
    (company) =>
      box(company.abbrev, [
        ...pair(
          "market",
          marketTokenSize,
          <CompanyToken width={marketTokenSize / 2} company={company} />,
          <CompanyToken
            width={marketTokenSize / 2}
            company={company}
            inverse={true}
          />,
        ),
        ...pair(
          "station",
          stationTokenSize,
          <CompanyToken width={stationTokenSize / 2} company={company} />,
          <CompanyToken
            width={stationTokenSize / 2}
            company={company}
            inverse={true}
          />,
        ),
      ]),
    overrideCompanies(
      compileCompanies(game),
      config.overrideCompanies,
      config.overrideSelection,
    ),
  );

  // "quantity" of 0 means remove the token entirely from the array
  let extraTokenNodes = compose(
    addIndex(map)((extraToken, index) => {
      const props = is(Object, extraToken) ? extraToken : { label: extraToken };
      return box(
        index,
        pair(
          "general",
          generalTokenSize,
          <Token width={generalTokenSize / 2} color="white" {...props} />,
          <Token width={generalTokenSize / 2} color="black" {...props} />,
        ),
      );
    }),
    reject(propEq(0, "quantity")),
  )(game.tokens || []);

  let tokenNode = concat(companyTokenNodes, extraTokenNodes)[index];

  return (
    <HtmlEditor>
      <div
        className="token printElement"
        data-testid={`game-${game.meta.slug}-token`}
      >
        <ColorContext.Provider value="companies">
          {tokenNode}
        </ColorContext.Provider>
      </div>
    </HtmlEditor>
  );
};

export default TokenPage;
