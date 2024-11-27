import { useParams } from "react-router";

import { addIndex, compose, concat, is, map, max, propEq, reject } from "ramda";

import Svg from "@/components/Svg";
import CompanyToken from "@/components/tokens/CompanyToken";
import Token from "@/components/tokens/Token";
import ColorContext from "@/context/ColorContext";
import { useConfig, useGame } from "@/hooks";
import { compileCompanies, overrideCompanies } from "@/util/companies.js";

const TokenSingle = () => {
  const { config } = useConfig();
  const game = useGame();
  const { index } = useParams();

  let grid =
    max(
      max(config.tokens.marketTokenSize, config.tokens.stationTokenSize),
      config.tokens.generalTokenSize,
    ) + 10;
  let gridCss = `${grid / 100.0}in`;

  let marketViewBox = `-${config.tokens.marketTokenSize / 2} -${config.tokens.marketTokenSize / 2} ${config.tokens.marketTokenSize} ${config.tokens.marketTokenSize}`;
  let stationViewBox = `-${config.tokens.stationTokenSize / 2} -${config.tokens.stationTokenSize / 2} ${config.tokens.stationTokenSize} ${config.tokens.stationTokenSize}`;
  let generalViewBox = `-${config.tokens.generalTokenSize / 2} -${config.tokens.generalTokenSize / 2} ${config.tokens.generalTokenSize} ${config.tokens.generalTokenSize}`;

  let marketPadding = `${(grid - config.tokens.marketTokenSize) / 200.0}in`;
  let stationPadding = `${(grid - config.tokens.stationTokenSize) / 200.0}in`;
  let generalPadding = `${(grid - config.tokens.generalTokenSize) / 200.0}in`;

  let companyTokenNodes = map(
    (company) => (
      <div className="token" key={company.abbrev}>
        <div
          className="printElement"
          style={{ height: gridCss, display: "inline-block" }}
        >
          <Svg
            viewBox={marketViewBox}
            style={{
              width: `${config.tokens.marketTokenSize / 100}in`,
              height: `${config.tokens.marketTokenSize / 100}in`,
              padding: marketPadding,
            }}
          >
            <CompanyToken
              width={config.tokens.marketTokenSize / 2}
              company={company}
            />
          </Svg>
          <Svg
            viewBox={marketViewBox}
            style={{
              width: `${config.tokens.marketTokenSize / 100}in`,
              height: `${config.tokens.marketTokenSize / 100}in`,
              padding: marketPadding,
            }}
          >
            <CompanyToken
              width={config.tokens.marketTokenSize / 2}
              company={company}
              inverse={true}
            />
          </Svg>
          <Svg
            viewBox={stationViewBox}
            style={{
              width: `${config.tokens.stationTokenSize / 100}in`,
              height: `${config.tokens.stationTokenSize / 100}in`,
              padding: stationPadding,
            }}
          >
            <CompanyToken
              width={config.tokens.stationTokenSize / 2}
              company={company}
            />
          </Svg>
          <Svg
            viewBox={stationViewBox}
            style={{
              width: `${config.tokens.stationTokenSize / 100}in`,
              height: `${config.tokens.stationTokenSize / 100}in`,
              padding: stationPadding,
            }}
          >
            <CompanyToken
              width={config.tokens.stationTokenSize / 2}
              company={company}
              inverse={true}
            />
          </Svg>
        </div>
      </div>
    ),
    overrideCompanies(
      compileCompanies(game),
      config.overrideCompanies,
      config.overrideSelection,
    ),
  );

  // "quantity" of 0 means remove the token entirely from the array
  let extraTokenNodes = compose(
    addIndex(map)((extraToken, index) => {
      if (is(Object, extraToken)) {
        return (
          <div className="token" key={index}>
            <div
              className="printElement"
              style={{ height: gridCss, display: "inline-block" }}
            >
              <Svg
                viewBox={generalViewBox}
                style={{
                  width: `${config.tokens.generalTokenSize / 100}in`,
                  height: `${config.tokens.generalTokenSize / 100}in`,
                  padding: generalPadding,
                }}
              >
                <Token
                  width={config.tokens.generalTokenSize / 2}
                  color="white"
                  {...extraToken}
                />
              </Svg>
              <Svg
                viewBox={generalViewBox}
                style={{
                  width: `${config.tokens.generalTokenSize / 100}in`,
                  height: `${config.tokens.generalTokenSize / 100}in`,
                  padding: generalPadding,
                }}
              >
                <Token
                  width={config.tokens.generalTokenSize / 2}
                  color="black"
                  {...extraToken}
                />
              </Svg>
            </div>
          </div>
        );
      } else {
        return (
          <div className="token" key={index}>
            <div
              className="printElement"
              style={{ height: gridCss, display: "inline-block" }}
            >
              <Svg
                viewBox={generalViewBox}
                style={{
                  width: `${config.tokens.generalTokenSize / 100}in`,
                  height: `${config.tokens.generalTokenSize / 100}in`,
                  padding: generalPadding,
                }}
              >
                <Token
                  width={config.tokens.generalTokenSize / 2}
                  label={extraToken}
                  color="white"
                />
              </Svg>
              <Svg
                viewBox={generalViewBox}
                style={{
                  width: `${config.tokens.generalTokenSize / 100}in`,
                  height: `${config.tokens.generalTokenSize / 100}in`,
                  padding: generalPadding,
                }}
              >
                <Token
                  width={config.tokens.generalTokenSize / 2}
                  label={extraToken}
                  color="black"
                />
              </Svg>
            </div>
          </div>
        );
      }
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
        {tokenNode}
      </ColorContext.Provider>
    </div>
  );
};

export default TokenSingle;
