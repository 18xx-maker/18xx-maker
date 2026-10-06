import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import {
  COMPANY_PRIMARY_KEYS,
  nextAbbrev,
} from "@/components/schemaForm/resolve";

import schema from "@/schemas/game.schema.json";

// A new company needs a name and an abbreviation no other company has
const defaults = (companies) => ({ abbrev: nextAbbrev(companies) });

// A copy gets a free abbreviation too
const copyOf = (copy, companies) => ({
  abbrev: nextAbbrev(companies, copy.abbrev || undefined),
});

// What a closed card shows: the color, the name and the abbreviation
const summary = (company, index) => (
  <>
    {typeof company?.color === "string" && company.color && (
      <span
        className="size-3 shrink-0 rounded-full border"
        style={{ backgroundColor: company.color }}
        aria-hidden="true"
      />
    )}
    <span className="truncate">{company?.name || `#${index + 1}`}</span>
    {company?.abbrev && (
      <span className="shrink-0 font-normal text-muted-foreground">
        {company.abbrev}
      </span>
    )}
  </>
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
