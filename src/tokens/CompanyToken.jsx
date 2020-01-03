import React from "react";

import Config from "../data/Config";
import Token from "./Token";

const CompanyToken = (props) => {
  let { company } = props;

  // Pass down all props that we don't use to look up the company
  let passing = {...props};
  delete passing.company;

  return (
    <Config>
      {(config, game) => {
        if (!company) {
          // No company, just pass everything we know to token
          return <Token {...passing} />
        }

        // Always want the label
        passing.label = company.abbrev;

        // Logo is only used if config says we should, and should be looked up
        // from abbrev if the log field isn't present for backwards
        // compatibility
        passing.logo = config.companySvgLogos === "none" ? null : (company.logo || company.abbrev);

        // Set the main color
        passing.color = props.color || company.color;

        // Anything that the company defined in it's "token" field should override
        passing = { ...passing, ...company.token };

        return <Token {...passing}/>;
      }}
    </Config>
  );
};

export default CompanyToken;
