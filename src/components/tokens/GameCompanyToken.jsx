import CompanyToken from "@/components/tokens/CompanyToken";
import Token from "@/components/tokens/Token";
import useGameCompany from "@/components/tokens/useGameCompany";

// This component is in charge of loading the proper company data from the
// current game from an abbrev and then rendering a token
const GameCompanyToken = (props) => {
  const passing = useGameCompany(props);

  if (!passing) {
    // We are dealing with a raw token
    return <Token {...props} />;
  }

  return <CompanyToken {...passing} />;
};

export default GameCompanyToken;
