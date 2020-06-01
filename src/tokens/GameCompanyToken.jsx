import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";
import GameContext from "../context/GameContext";

import Token from "./Token";
import CompanyToken from "./CompanyToken";

import { overrideCompanies, compileCompanies } from "../util";

import findIndex from "ramda/src/findIndex";
import propEq from "ramda/src/propEq";

// This component is in charge of loading the proper company data from the
// current game from an abbrev and then rendering a token
const GameCompanyToken = (props) => {
  const { game } = useContext(GameContext);
  const { config } = useContext(ConfigContext);

  let { abbrev } = props;
  let passing = { ...props };
  delete passing.abbrev;

  let companies = overrideCompanies(compileCompanies(game), config.overrideCompanies, config.overrideSelection);

  // Look into the original game companies and find this abbrev
  let companyIndex = findIndex(propEq("abbrev", abbrev), game.companies);

  if (companyIndex === -1) {
    // We are dealing with a raw token
    return <Token {...props} />
  }

  // Look up that index in the final company list
  passing.company = companies[companyIndex];

  return <CompanyToken {...passing} />;
};

export default GameCompanyToken;
