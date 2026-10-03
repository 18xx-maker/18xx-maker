import { has, is, isEmpty, keys } from "ramda";

import configSchema from "@/schemas/config.schema.json";

// Files larger than this are never sniffed for a config
export const MAX_CONFIG_BYTES = 1024 * 1024;

// A config is a non-empty object of config settings only. Game files carry
// an info key and anything else with unknown keys is not a config.
export const isConfigJson = (value) =>
  is(Object, value) &&
  !Array.isArray(value) &&
  !isEmpty(value) &&
  !has("info", value) &&
  keys(value).every((key) => has(key, configSchema.properties));

// Resolves with the parsed config when the file is one, otherwise undefined
export const sniffConfigFile = async (file) => {
  const jsonLike =
    /\.json$/i.test(file?.name || "") || file?.type === "application/json";

  if (!jsonLike || file.size > MAX_CONFIG_BYTES) {
    return undefined;
  }

  try {
    const value = JSON.parse(await file.text());
    return isConfigJson(value) ? value : undefined;
  } catch {
    return undefined;
  }
};
