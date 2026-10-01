import games from "@/data/games";
import { compileCompanies, overrideCompanies } from "@/util/companies";

const game = games["18Test"];

describe("compileCompanies", () => {
  const companies = compileCompanies(game);
  const byAbbrev = (abbrev) => companies.find((c) => c.abbrev === abbrev);

  it("should keep every company in order", () => {
    expect(companies.map((c) => c.abbrev)).toEqual(
      game.companies.map((c) => c.abbrev),
    );
  });

  it("should give majors the default shares and tokens", () => {
    const company = byAbbrev("LBRR");

    expect(company.shareType).toBe("default");
    expect(company.shares).toEqual(game.shareTypes.default);
    expect(company.tokenType).toBe("default");
    expect(company.tokens).toEqual(["Major"]);
  });

  it("should give minors the minor shares and tokens", () => {
    const company = byAbbrev("VRR");

    expect(company.shareType).toBe("minor");
    expect(company.shares).toEqual(game.shareTypes.minor);
    expect(company.tokenType).toBe("minor");
    expect(company.tokens).toEqual(["Minor"]);
  });

  it("should keep shares a company defines itself", () => {
    const company = byAbbrev("BLRR");

    expect(company.shares).toEqual(game.companies[0].shares);
    expect(company.shareType).toBeUndefined();
    // Tokens still come from the defaults
    expect(company.tokenType).toBe("default");
  });

  it("should copy the shared arrays", () => {
    const [company] = compileCompanies(game);
    company.shares.push("changed");
    company.tokens.push("changed");

    expect(game.shareTypes.default).toHaveLength(2);
    expect(game.tokenTypes.default).toEqual(["Major"]);
  });

  it("should resolve named share and token types", () => {
    const named = {
      shareTypes: { odd: [{ percent: 40 }] },
      tokenTypes: { big: ["Big"] },
      companies: [{ abbrev: "A", shares: "odd", tokens: "big" }],
    };
    const [company] = compileCompanies(named);

    expect(company.shareType).toBe("odd");
    expect(company.shares).toEqual([{ percent: 40 }]);
    expect(company.tokenType).toBe("big");
    expect(company.tokens).toEqual(["Big"]);
  });

  it("should handle games without companies or types", () => {
    expect(compileCompanies({})).toEqual([]);
    expect(compileCompanies({ companies: [{ abbrev: "A" }] })).toEqual([
      { abbrev: "A" },
    ]);
  });
});

describe("overrideCompanies", () => {
  const companies = [
    { name: "One", abbrev: "1", logo: "own", color: "red" },
    { name: "Two", abbrev: "2", color: "blue" },
  ];

  it("should do nothing for none or unknown overrides", () => {
    expect(overrideCompanies(companies, "none")).toBe(companies);
    expect(overrideCompanies(companies, "missing")).toBe(companies);
  });

  it("should clear the logo and token the override does not have", () => {
    const own = [{ name: "One", logo: "own", token: "own-token" }];
    const [result] = overrideCompanies(own, "1830");

    expect(result.name).toBe("Pennsylvania Railroad");
    expect(result.logo).toBe("1830/PRR");
    expect(result.token).toBeUndefined();
  });

  it("should merge by index and take the override logo", () => {
    const result = overrideCompanies(companies, "1830");

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Pennsylvania Railroad");
    expect(result[0].abbrev).toBe("PRR");
    expect(result[0].logo).toBe("1830/PRR");
    expect(result[0].color).toBe("green");
  });

  it("should select overrides by index", () => {
    const result = overrideCompanies(companies, "1830", [1]);

    // Only the selected override is used, so the second company is untouched
    expect(result.map((c) => c.abbrev)).toEqual(["NYC", "2"]);
  });

  it("should apply every selection in order", () => {
    const two = [{}, {}];
    const three = [{}, {}, {}];

    const abbrevs = (list, selection) =>
      overrideCompanies(list, "1830", selection).map((c) => c.abbrev);

    expect(abbrevs(two, [1, 0])).toEqual(["NYC", "PRR"]);
    expect(abbrevs(three, [2, 0, 1])).toEqual(["CPR", "PRR", "NYC"]);
    expect(abbrevs(two, [0, 2])).toEqual(["PRR", "CPR"]);
  });

  it("should not add companies the game does not have", () => {
    expect(overrideCompanies([{ name: "A" }], "1830")).toHaveLength(1);
    expect(overrideCompanies(undefined, "1830")).toEqual([]);
  });
});
