import { applyCompanyOverrides } from "#util/companies/companyOverrides";

const overrides = {
  set: {
    companies: [
      { name: "One", logo: "l1", token: "t1" },
      { name: "Two", logo: "l2", token: "t2" },
    ],
  },
};
const companies = [
  { name: "A", abbrev: "A", logo: "own", token: "own" },
  { name: "B", abbrev: "B" },
  { name: "C", abbrev: "C" },
];

describe("applyCompanyOverrides", () => {
  it("returns the companies for none or an unknown override", () => {
    expect(applyCompanyOverrides(overrides, companies, "none")).toBe(companies);
    expect(applyCompanyOverrides(overrides, companies, "other")).toBe(
      companies,
    );
  });

  it("merges the override company at the same index", () => {
    const result = applyCompanyOverrides(overrides, companies, "set");

    expect(result[0]).toEqual({
      name: "One",
      abbrev: "A",
      logo: "l1",
      token: "t1",
    });
    expect(result[1].name).toBe("Two");
    // No override for the third company
    expect(result[2]).toBe(companies[2]);
  });

  it("selects the overrides by index", () => {
    const result = applyCompanyOverrides(overrides, companies, "set", [1, 0]);
    expect(result.map((c) => c.name)).toEqual(["Two", "One", "C"]);
  });

  it("handles missing companies", () => {
    expect(applyCompanyOverrides(overrides, undefined, "set")).toEqual([]);
  });
});
