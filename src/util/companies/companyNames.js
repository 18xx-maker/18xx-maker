// What a charter or share card prints as the name of a company, by the
// companyNames config: name, alias (the name when there is no alias) or both
// (the name, with the alias as the second line). fallbackSubtext is the
// subtext of a share, used when the company has none.
export const companyNames = (company, mode, fallbackSubtext) => {
  const alias = company.alias?.trim() ? company.alias : undefined;
  const subtext = company.subtext || fallbackSubtext;

  if (mode === "alias" && alias) return { name: alias, subtext };
  if (mode === "both" && alias) return { name: company.name, subtext: alias };
  return { name: company.name, subtext };
};
