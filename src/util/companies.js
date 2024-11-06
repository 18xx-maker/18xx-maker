import { addIndex, is, map, mergeLeft, prop } from "ramda";

import { companies as overrides } from "../data";

export const compileCompanies = (game) => {
  return map((company) => {
    if (
      company.minor &&
      !company.tokens &&
      game.tokenTypes &&
      game.tokenTypes["minor"]
    ) {
      company.tokenType = "minor";
      company.tokens = game.tokenTypes["minor"];
    } else if (
      !company.tokens &&
      game.tokenTypes &&
      game.tokenTypes["default"]
    ) {
      company.tokenType = "default";
      company.tokens = game.tokenTypes["default"];
    } else if (is(String, company.tokens)) {
      company.tokenType = company.tokens;
      company.tokens = game.tokenTypes[company.tokens];
    }

    if (
      company.minor &&
      !company.shares &&
      game.shareTypes &&
      game.shareTypes["minor"]
    ) {
      company.shareType = "minor";
      company.shares = game.shareTypes["minor"];
    } else if (
      !company.shares &&
      game.shareTypes &&
      game.shareTypes["default"]
    ) {
      company.shareType = "default";
      company.shares = game.shareTypes["default"];
    } else if (is(String, company.shares)) {
      company.shareType = company.shares;
      company.shares = game.shareTypes[company.shares];
    }

    return company;
  }, (game && game.companies) || []);
};

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
        selections
      );
    }

    // If we have a valid override for the index, merge!
    if (overrideCompanies[index]) {
      company = mergeLeft(company, overrideCompanies[index]);

      // Remove some fields if they don't exist on the override company
      company.logo = overrideCompanies[index].logo;
      company.token = overrideCompanies[index].token;
    }

    return company;
  }, companies || []);
};
