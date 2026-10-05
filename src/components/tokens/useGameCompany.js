import { findIndex, propEq } from "ramda";

import { useConfig, useGame } from "@/hooks";
import {
  compileCompanies,
  overrideCompanies,
} from "@/util/companies/companies";

// Loads the proper company data from the current game for an abbrev. Gives
// back the props for a company token, or null when the abbrev is not a company
// (a raw token).
const useGameCompany = (props) => {
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
    return null;
  }

  // Look up that index in the final company list
  passing.company = companies[companyIndex];

  return passing;
};

export default useGameCompany;
