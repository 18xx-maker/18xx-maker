import React, { useContext } from 'react';
import ColorContext from '../context/ColorContext';
import ConfigContext from "../context/ConfigContext";
import GameContext from '../context/GameContext';
import PhaseContext from '../context/PhaseContext';

import tinycolor from "tinycolor2";

import curry from "ramda/src/curry";
import is from "ramda/src/is";
import mergeDeepRight from "ramda/src/mergeDeepRight";

import { mapKeys } from "../util.js";

const getThemeName = (file) => file.replace(/^.*\/([^\/]+)\.json$/, (_,x) => x);

const rawMapThemes = import.meta.glob("../data/themes/maps/*.json", { eager: true, import: "default" });
const mapThemes = mapKeys(getThemeName, rawMapThemes);

const rawCompanyThemes = import.meta.glob("../data/themes/companies/*.json", { eager: true, import: "default" });
const companyThemes = mapKeys(getThemeName, rawCompanyThemes);

const colorAliases = {
  "cyan": "lightBlue",
  "grey": "gray",
  "lightGreen": "brightGreen",
  "navy": "navyBlue",
  "purple": "violet"
};

const resolveColor = curry((theme, companiesTheme, phase, context, game, name) => {
  if (colorAliases[name]) {
    name = colorAliases[name];
  }

  let colors = (mapThemes[theme || "gmt"] || mapThemes["gmt"]).colors;

  // Add in company colors
  colors["companies"] = mergeDeepRight(companyThemes["rob"].colors,
                                       (companyThemes[companiesTheme || "rob"] || companyThemes["rob"]).colors);

  // Add in game colors
  colors = mergeDeepRight(colors,
                          game ? game.colors || {} : {});

  // Get color from context if it exists
  let color = colors[name];
  if(colors[context] && colors[context][name]) {
    color = colors[context][name];
  }

  // If color is an object use phase
  if(is(Object,color)) {
    color = color[phase || "default"] || color["default"];
  }
  return color;
});

const textColor = curry((theme, companiesTheme, phase, game, color) => {
  let text = [resolveColor(theme, companiesTheme, phase, null, game, "white"),
              resolveColor(theme, companiesTheme, phase, null, game, "black")];
  let tc = tinycolor(color);
  return tinycolor.mostReadable(tc, text).toRgbString();
});

const strokeColor = (color, amount = 20) => {
  let tc = tinycolor(color);

  if (amount >= 0) {
    return tc.darken(amount).toString();
  } else {
    return tc.lighten(-1 * amount).toString();
  }
};

const Color = ({ context, children }) => {
  const { config } = useContext(ConfigContext);
  const { game } = useContext(GameContext);
  const { theme, companiesTheme } = config;

  return (
    <ColorContext.Consumer>
      {colorContext => (
        <PhaseContext.Consumer>
          {phase => {
            let c = resolveColor(theme, companiesTheme, phase, context || colorContext, game);
            let p = resolveColor(theme, companiesTheme, phase, undefined, game);
            let t = textColor(theme, companiesTheme, phase, game);
            let s = strokeColor;

            return (
              <React.Fragment>
                {children(c, t, s, p)}
              </React.Fragment>
            );
          }}
        </PhaseContext.Consumer>
      )}
    </ColorContext.Consumer>
  );
};

export default Color;
