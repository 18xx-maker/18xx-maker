import { addIndex, map, mergeRight, prop } from "ramda";

// Replaces company fields with the ones from an override set. overrides maps
// an override name to { companies } (the src/data/companies files). It is an
// argument so this works without the bundler, see the CLI.
export const applyCompanyOverrides = (
  overrides,
  companies,
  override,
  selections,
) => {
  if (override === "none" || !overrides[override]) {
    return companies;
  }

  let overrideCompanies = overrides[override].companies;

  // If we have selections, filter/select our overrides with them
  if ((selections || []).length > 0) {
    overrideCompanies = map(
      (index) => prop(index, overrideCompanies),
      selections,
    );
  }

  return addIndex(map)((company, index) => {
    // If we have a valid override for the index, merge!
    if (overrideCompanies[index]) {
      company = mergeRight(company, overrideCompanies[index]);

      // Remove some fields if they don't exist on the override company
      company.logo = overrideCompanies[index].logo;
      company.token = overrideCompanies[index].token;
      company.alias = overrideCompanies[index].alias;
    }

    return company;
  }, companies || []);
};
