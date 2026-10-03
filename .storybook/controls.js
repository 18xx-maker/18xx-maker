import { identity, keys, sortBy } from "ramda";

import { companyThemes, mapThemes } from "@/data";

// Color names the atoms accept: the map theme colors (hex fills, terrain,
// tracks) and the company theme colors (tokens, labels, logos)
export const mapColors = sortBy(identity, keys(mapThemes.gmt.colors));
export const companyColors = sortBy(identity, keys(companyThemes.rob.colors));
export const allColors = sortBy(identity, [
  ...new Set([...mapColors, ...companyColors]),
]);

// A select of color names, with the empty option for "not set"
export const colorSelect = (options = allColors) => ({
  control: { type: "select" },
  options: ["", ...options],
});

export const rotation = {
  control: { type: "range", min: 0, max: 330, step: 30 },
};
