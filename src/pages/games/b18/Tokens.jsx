import "@/pages/games/b18/b18.css";
import ColorContext from "@/context/ColorContext";
import CompanyToken from "@/tokens/CompanyToken";
import Svg from "@/Svg";
import Token from "@/tokens/Token";
import { compileCompanies, overrideCompanies } from "@/util/companies";
import { useConfig, useGame } from "@/hooks";

import { addIndex, is, map, compose, reject, propEq } from "ramda";

const Tokens = () => {
  const { config } = useConfig();
  const game = useGame();

  let companyTokenNodes = map(
    (company) => (
      <div className="token" key={company.abbrev}>
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
          <div className="token" key={index}>
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
          <div className="token" key={index}>
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
      <div className="b18" style={{ width: `60px` }}>
        <div className="tokens">
          {companyTokenNodes}
          {extraTokenNodes}
        </div>
      </div>
      <style>{`@media print {@page {size: 60px ${totalHeight}px;}}`}</style>
    </ColorContext.Provider>
  );
};

export default Tokens;
