import { companyNames } from "@/util/companies/companyNames";

const company = { name: "Black Railroad", alias: "Black Rail" };

describe("companyNames", () => {
  it("prints the name in name mode", () => {
    expect(companyNames(company, "name")).toEqual({
      name: "Black Railroad",
      subtext: undefined,
    });
  });

  it("prints the name when there is no mode", () => {
    expect(companyNames(company, undefined).name).toBe("Black Railroad");
  });

  it("prints the alias in alias mode", () => {
    expect(companyNames(company, "alias")).toEqual({
      name: "Black Rail",
      subtext: undefined,
    });
  });

  it("prints the alias as the subtext in both mode", () => {
    expect(companyNames(company, "both")).toEqual({
      name: "Black Railroad",
      subtext: "Black Rail",
    });
  });

  it.each(["name", "alias", "both"])(
    "prints the name in %s mode without an alias",
    (mode) => {
      expect(companyNames({ name: "Blue" }, mode)).toEqual({
        name: "Blue",
        subtext: undefined,
      });
    },
  );

  it.each(["", "   "])("ignores the alias %j", (alias) => {
    for (const mode of ["name", "alias", "both"]) {
      expect(
        companyNames({ name: "Blue", subtext: "Sub", alias }, mode),
      ).toEqual({ name: "Blue", subtext: "Sub" });
    }
  });

  it("keeps the subtext of the company in name and alias mode", () => {
    const withSubtext = { ...company, subtext: "Sub" };
    expect(companyNames(withSubtext, "name").subtext).toBe("Sub");
    expect(companyNames(withSubtext, "alias").subtext).toBe("Sub");
  });

  it("puts the alias before the subtext in both mode", () => {
    expect(
      companyNames({ ...company, subtext: "Sub" }, "both", "Share"),
    ).toEqual({ name: "Black Railroad", subtext: "Black Rail" });
  });

  it("falls back to the subtext of the company, then of the share", () => {
    expect(
      companyNames({ name: "A", subtext: "Sub" }, "both", "Share"),
    ).toEqual({ name: "A", subtext: "Sub" });
    expect(companyNames({ name: "A" }, "both", "Share")).toEqual({
      name: "A",
      subtext: "Share",
    });
    expect(companyNames(company, "alias", "Share").subtext).toBe("Share");
  });
});
