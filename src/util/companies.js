import { companies as overrides } from "@/data/index.js";
import { applyCompanyOverrides } from "./companyOverrides.js";

export { compileCompanies } from "./index.js";

export const overrideCompanies = (companies, override, selections) =>
  applyCompanyOverrides(overrides, companies, override, selections);
