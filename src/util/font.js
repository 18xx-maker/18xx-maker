import { concat, compose, pick, prop, reduce, mergeRight } from "ramda";

import { capitalize, mapKeys } from "../util";

const fixFontKeys = mapKeys(compose(concat("font"), capitalize));

const fontPick = pick(['family', 'size', 'weight']);

export const resolveFont = (contexts, fonts) => {
  let font = fixFontKeys(prop("font", reduce((result, context) => {
    let newFonts = prop(context, result.fonts);

    if (newFonts) {
      return {
        font: mergeRight(result.font, fontPick(newFonts)),
        fonts: newFonts
      };
    } else {
      return result;
    }
  }, {
    font: fontPick(fonts || {}),
    fonts: fonts
  }, contexts)));

  font.lineHeight = font.fontSize;
  return font;
};
