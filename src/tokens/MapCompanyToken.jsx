import React from "react";

import Config from "../data/Config";

import CompanyToken from "./CompanyToken";
import Token from "./Token";

const MapCompanyToken = (props) => {
  let { company } = props;

  // Pass down all props that we don't use to look up the company
  let passing = {...props};
  delete passing.company;

  return (
    <Config>
      {(config, game) => {
        if (config.plainMapCompanies) {
          passing.label = company.abbrev;
          passing.color = "white";
          passing.labelColor = props.color || "black";
          passing.logo = undefined;
          return <Token {...passing} />
        } else {
          return <CompanyToken {...props} />
        }
      }}
    </Config>
  );
};
export default MapCompanyToken;
