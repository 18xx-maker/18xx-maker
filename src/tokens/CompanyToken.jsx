import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";

import Token from "./Token";
import ColorContext from "../context/ColorContext";

const CompanyToken = (props) => {
  let { company } = props;

  const { config } = useContext(ConfigContext);

  // Pass down all props that we don't use to look up the company
  let passing = {...props};
  delete passing.company;

  if (!company) {
    // No company, just pass everything we know to token
    return <Token {...passing} />
  }

  // Always want the label
  passing.label = company.abbrev;

  // Logo is only used if config says we should, and should be looked up
  // from abbrev if the log field isn't present for backwards
  // compatibility
  passing.logo = config.companySvgLogos === "none" ? null : company.logo;

  // Set the main color
  passing.color = props.color || company.color;

  // Anything that the company defined in it's "token" field should override
  passing = { ...passing, ...company.token };

  return (
    <ColorContext.Provider value="companies">
      <Token {...passing}/>
    </ColorContext.Provider>
  );
};

export default CompanyToken;
