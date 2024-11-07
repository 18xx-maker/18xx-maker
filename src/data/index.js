import {
  binary,
  compose,
  flip,
  replace,
  startsWith,
  pickBy,
  mapObjIndexed,
} from "ramda";

import { mapKeys } from "../util.js";

export const getID = replace(/^\.\/[^\/]+\/([^\.]+)\.[a-z]+$/, "$1");

// Games
export { default as games } from "./games";

// Tiles
export { default as tiles } from "./tiles";

// Publishers
import publishersJson from "./publishers/index.json";
const publisherImageFiles = import.meta.glob("./publishers/*.png", {
  eager: true,
  import: "default",
});
const publisherImages = mapKeys(getID, publisherImageFiles);
export const publishers = mapObjIndexed(
  (publisher, id) => ({
    imageUrl: publisherImages[id],
    ...publisher,
  }),
  publishersJson,
);

// Companies
const companyFiles = import.meta.glob("./companies/*.json", {
  eager: true,
  import: "default",
});
export const companies = mapKeys(getID, companyFiles);

// Logos
const logoFiles = import.meta.glob("./logos/*/*.svg", {
  eager: true,
  import: "default",
});
export const logos = mapKeys(getID, logoFiles);

// Icons
const iconFiles = import.meta.glob("./icons/*.svg", {
  eager: true,
  import: "default",
});
export const icons = mapKeys(getID, iconFiles);

// Themes
const themeFiles = import.meta.glob("./themes/**/*.json", {
  eager: true,
  import: "default",
});
export const themes = mapKeys(getID, themeFiles);
const filterThemes = (type, themes) =>
  compose(
    mapKeys(replace(`${type}/`, "")),
    pickBy(flip(binary(startsWith(type)))),
  )(themes);
export const mapThemes = filterThemes("maps", themes);
export const companyThemes = filterThemes("companies", themes);
