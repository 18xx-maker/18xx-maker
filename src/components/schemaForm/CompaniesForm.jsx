import { Component } from "react";

import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import {
  COMPANY_PRIMARY_KEYS,
  nextAbbrev,
} from "@/components/schemaForm/resolve";
import CompanyToken from "@/components/tokens/CompanyToken";

import schema from "@/schemas/game.schema.json";

// A new company needs a name and an abbreviation no other company has
const defaults = (companies) => ({ abbrev: nextAbbrev(companies) });

// A copy gets a free abbreviation too
const copyOf = (copy, companies) => ({
  abbrev: nextAbbrev(
    companies,
    typeof copy.abbrev === "string" && copy.abbrev ? copy.abbrev : undefined,
  ),
});

// A company the token cannot draw (an edit that fits the JSON but not the
// schema) shows no token rather than taking the panel down
class TokenBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous) {
    if (this.state.failed && previous.company !== this.props.company) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// The token of the company, as the print pages draw it
const SummaryToken = ({ company }) => {
  if (typeof company?.abbrev !== "string" || !company.abbrev) return null;
  return (
    <TokenBoundary company={company}>
      <svg
        viewBox="-26 -26 52 52"
        className="mr-1.5 inline-block size-5 align-middle"
        aria-hidden="true"
        data-testid="company-token"
      >
        <CompanyToken company={company} />
      </svg>
    </TokenBoundary>
  );
};

// What a closed card shows: the token, the name and the abbreviation. One
// inline run, so the title reads "Name ABBREV" and truncates as one.
const summary = (company, index) => (
  <span className="truncate">
    <SummaryToken company={company} />
    {company?.name || `#${index + 1}`}
    {company?.abbrev && (
      <>
        {" "}
        <span className="font-normal text-muted-foreground">
          {company.abbrev}
        </span>
      </>
    )}
  </span>
);

// The companies of the game, generated from the game schema. The cards start
// closed: a company has many fields.
const CompaniesForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <SchemaField
      keys={["companies"]}
      schema={schema.properties.companies}
      defaults={defaults}
      primary={COMPANY_PRIMARY_KEYS}
      startCollapsed
      summary={summary}
      copyOf={copyOf}
    />
  </SchemaFormProvider>
);

export default CompaniesForm;
