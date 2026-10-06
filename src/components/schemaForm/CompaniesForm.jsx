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
  abbrev: nextAbbrev(
    companies,
    typeof copy.abbrev === "string" && copy.abbrev ? copy.abbrev : undefined,
  ),
});

// What a closed card shows: the color, the name and the abbreviation. One
// inline run of text, so the title reads "Name ABBREV" and truncates as one.
const summary = (company, index) => (
  <span className="truncate">
    {typeof company?.color === "string" && company.color && (
      <span
        className="mr-1.5 inline-block size-3 rounded-full border align-middle"
        style={{ backgroundColor: company.color }}
        aria-hidden="true"
      />
    )}
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
