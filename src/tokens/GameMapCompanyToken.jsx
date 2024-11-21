import { useConfig, useGame } from "@/hooks";
import Token from "@/tokens/Token";
import MapCompanyToken from "@/tokens/MapCompanyToken";

import { overrideCompanies, compileCompanies } from "@/util/companies.js";

import { findIndex, propEq } from "ramda";

// This component is in charge of loading the proper company data from the
// current game from an abbrev and then rendering a token
const GameMapCompanyToken = (props) => {
  const game = useGame();
  const { config } = useConfig();

  let { abbrev } = props;
  let passing = { ...props };
  delete passing.abbrev;

  let companies = overrideCompanies(
    compileCompanies(game),
    config.overrideCompanies,
    config.overrideSelection,
  );

  // Look into the original game companies and find this abbrev
  let companyIndex = findIndex(
    propEq(abbrev, "abbrev"),
    (game && game.companies) || [],
  );

  if (companyIndex === -1) {
    // We are dealing with a raw token
    return <Token {...props} />;
  }

  // Look up that index in the final company list
  passing.company = companies[companyIndex];

  return <MapCompanyToken {...passing} />;
};

export default GameMapCompanyToken;
