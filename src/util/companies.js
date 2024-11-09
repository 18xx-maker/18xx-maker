import { addIndex, map, mergeRight, prop } from "ramda";

import { companies as overrides } from "../data/index.js";

export { compileCompanies } from "../util.js";

export const overrideCompanies = (companies, override, selections) => {
  if (override === "none" || !overrides[override]) {
    return companies;
  }

  let overrideCompanies = overrides[override].companies;

  return addIndex(map)((company, index) => {
    // If we have selections, filter/select our overrides with them
    if ((selections || []).length > 0) {
      overrideCompanies = map(
        (index) => prop(index, overrideCompanies),
        selections,
      );
    }

    // If we have a valid override for the index, merge!
    if (overrideCompanies[index]) {
      company = mergeRight(company, overrideCompanies[index]);

      // Remove some fields if they don't exist on the override company
      company.logo = overrideCompanies[index].logo;
      company.token = overrideCompanies[index].token;
    }

    return company;
  }, companies || []);
};
