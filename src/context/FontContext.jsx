import React, { useContext } from "react";
import ConfigContext from "./ConfigContext";

import { capitalize, mapKeys } from "../util";

import append from "ramda/src/append";
import compose from "ramda/src/compose";
import concat from "ramda/src/concat";
import merge from "ramda/src/merge";
import pick from "ramda/src/pick";
import prop from "ramda/src/prop";
import reduce from "ramda/src/reduce";

const FontContext = React.createContext([]);

const fixFontKeys = mapKeys(compose(concat("font"), capitalize));

// Takes in a new font string, and will add it to current context
export const SetFont = ({context, children}) => (
  <FontContext.Consumer>
    {prev => {
      return (
        <FontContext.Provider value={append(context, prev)}>
          {children}
        </FontContext.Provider>
      );
    }}
  </FontContext.Consumer>
);

const fontPick = pick(['family', 'size', 'weight']);
export const resolveFont = (contexts, fonts) => {
  let font = fixFontKeys(prop("font", reduce((result, context) => {
    let newFonts = prop(context, result.fonts);

    if (newFonts) {
      return {
        font: merge(result.font, fontPick(newFonts)),
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

export const GetFont = ({children}) => {
  const { config } = useContext(ConfigContext);

  return (
    <FontContext.Consumer>
      {context => children(resolveFont(context, config.fonts))}
    </FontContext.Consumer>
  );
};

export default FontContext;
