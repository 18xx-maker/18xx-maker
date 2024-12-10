import CompanyToken from "@/components/tokens/CompanyToken";
import Token from "@/components/tokens/Token";

import { useConfig } from "@/hooks";

const MapCompanyToken = (props) => {
  let { company } = props;

  const { config } = useConfig();

  // Pass down all props that we don't use to look up the company
  let passing = { ...props };
  delete passing.company;

  if (config.plainMapCompanies) {
    passing.label = company.abbrev;
    passing.color = "white";
    passing.labelColor = props.color || "black";
    passing.logo = undefined;
    return <Token {...passing} />;
  } else {
    return <CompanyToken {...props} />;
  }
};
export default MapCompanyToken;
