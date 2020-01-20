import React from "react";

import Token from "./Token";
import MapCompanyToken from "./MapCompanyToken";
import Config from "../data/Config";

import { overrideCompanies, compileCompanies } from "../util";

import findIndex from "ramda/src/findIndex";
import propEq from "ramda/src/propEq";

// This component is in charge of loading the proper company data from the
// current game from an abbrev and then rendering a token
const GameMapCompanyToken = (props) => {
  let { abbrev } = props;
  let passing = { ...props };
  delete passing.abbrev;

  return (
    <Config>
      {(config, game) => {
        let companies = overrideCompanies(compileCompanies(game), config.overrideCompanies, config.overrideSelection);

        // Look into the original game companies and find this abbrev
        let companyIndex = findIndex(propEq("abbrev", abbrev), (game.companies || []));

        if (companyIndex === -1) {
          // We are dealing with a raw token
          return <Token {...props} />
        }

        // Look up that index in the final company list
        passing.company = companies[companyIndex];

        return <MapCompanyToken {...passing} />;
      }}
    </Config>
  );
};

export default GameMapCompanyToken;
