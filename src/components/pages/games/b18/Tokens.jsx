import { addIndex, compose, is, map, propEq, reject } from "ramda";

import Svg from "@/components/Svg";
import CompanyToken from "@/components/tokens/CompanyToken";
import Token from "@/components/tokens/Token";

import ColorContext from "@/context/ColorContext";
import { useConfig, useGame } from "@/hooks";
import { compileCompanies, overrideCompanies } from "@/util/companies";

const Tokens = () => {
  const { config } = useConfig();
  const game = useGame();

  let companyTokenNodes = map(
    (company) => (
      <div
        className="token w-[90px] h-[30px] m-0 p-0 flex flex-row"
        key={company.abbrev}
      >
        <Svg width={30} height={30} viewBox="-26 -26 52 52">
          <CompanyToken company={company} />
        </Svg>
        <Svg width={30} height={30} viewBox="-26 -26 52 52">
          <CompanyToken company={company} inverse={true} />
        </Svg>
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
          <div
            className="token w-[90px] h-[30px] m-0 p-0 flex flex-row"
            key={index}
          >
            <Svg width={30} height={30} viewBox="-26 -26 52 52">
              <Token color="white" {...extraToken} />
            </Svg>
            <Svg width={30} height={30} viewBox="-26 -26 52 52">
              <Token color="black" {...extraToken} />
            </Svg>
          </div>
        );
      } else {
        return (
          <div
            className="token w-[90px] h-[30px] m-0 p-0 flex flew-row"
            key={index}
          >
            <Svg width={30} height={30} viewBox="-26 -26 52 52">
              <Token label={extraToken} color="white" />
            </Svg>
            <Svg width={30} height={30} viewBox="-26 -26 52 52">
              <Token label={extraToken} color="black" />
            </Svg>
          </div>
        );
      }
    }),
    reject(propEq(0, "quantity")),
  )(game.tokens || []);

  let totalHeight = 30 * (companyTokenNodes.length + extraTokenNodes.length);

  return (
    <ColorContext.Provider value="companies">
      <div className="b18 relative text-left" style={{ width: `60px` }}>
        <div className="tokens m-0 p-0">
          {companyTokenNodes}
          {extraTokenNodes}
        </div>
      </div>
      <style>{`@media print {@page {size: 60px ${totalHeight}px;}}`}</style>
    </ColorContext.Provider>
  );
};

export default Tokens;
