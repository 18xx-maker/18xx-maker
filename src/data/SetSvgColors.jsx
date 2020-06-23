import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";

import ColorContext from "../context/ColorContext";
import Color from "./Color";

import chain from "ramda/src/chain";
import concat from "ramda/src/concat";
import join from "ramda/src/join";
import keys from "ramda/src/keys";

const colors = keys(require("./themes/companies/rob.json").colors);
const mapColors = keys(require("./themes/maps/gmt.json").colors);

const SetSvgColors = () => {
  const { config } = useContext(ConfigContext);
  const companySvgLogos = config.companySvgLogos;

  return (
    <ColorContext.Provider value="companies">
      <Color>
        {(c, t, s, p) => {
          let rules = [];

          if (companySvgLogos !== "original") {
            rules = concat(rules, chain(color => [
              `svg .color-${color}{fill:${c(color)}}`,
              `svg .color-stroke-${color}{stroke:${c(color)}}`
            ], colors));

            rules = concat(rules, chain(color => [
              `svg .color-map-${color}{fill:${p(color)}}`,
              `svg .color-stroke-map-${color}{stroke:${p(color)}}`
            ], mapColors));
          }

          rules = concat(rules, chain(color => {
            if (color !== "white") {
              return [`svg.color-reserved .color-${color}{fill:${c("gray")}}`,
                 `svg.color-reserved .color-stroke-${color}{stroke:${c("gray")}}`]
            }

            return [];
          }, colors));

          rules.push(`svg.color-reserved .color-reserved-white{fill:${c("white")}}`);
          rules.push(`svg.color-reserved .color-stroke-reserved-white{stroke:${c("white")}}`);
          rules.push(`svg.color-reserved .color-reserved-gray{fill:${c("gray")}}`);
          rules.push(`svg.color-reserved .color-stroke-reserved-gray{stroke:${c("gray")}}`);

          // Color changing for icons
          rules = concat(rules, chain(color => [
            `svg.icon-color-main-${color} .color-main{fill:${c(color)}}`,
            `svg.icon-color-main-${color} .color-stroke-main{stroke:${c(color)}}`,
          ], colors));

          rules = concat(rules, chain(color => [
            `svg.icon-color-main-map-${color} .color-main{fill:${p(color)}}`,
            `svg.icon-color-main-map-${color} .color-stroke-main{stroke:${p(color)}}`,
          ], mapColors));

          // Color changing for logos
          if (companySvgLogos === "main") {
            rules = concat(rules, chain(color => [
              `svg.color-main-${color} .color-main{fill:${c(color)}}`,
              `svg.color-main-${color} .color-stroke-main{stroke:${c(color)}}`,
            ], colors));
          }

          return <style>{join(" ", rules)}</style>;
        }}
      </Color>
    </ColorContext.Provider>
  );
}

export default SetSvgColors;
