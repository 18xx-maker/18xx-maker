import React from "react";
import { connect } from "react-redux";

import ColorContext from "../context/ColorContext";
import Color from "./Color";

import chain from "ramda/src/chain";
import concat from "ramda/src/concat";
import join from "ramda/src/join";
import keys from "ramda/src/keys";

const colors = keys(require("./themes/companies/rob.json"));

const SetSvgColors = ({ companySvgLogos }) => {
  if (companySvgLogos === "none") return null;

  return (
    <ColorContext.Provider value="companies">
      <Color>
        {c => {
          let rules = [];

          if (companySvgLogos !== "original") {
            rules = concat(rules, chain(color => [
              `svg .color-${color}{fill:${c(color)}}`,
              `svg .color-stroke-${color}{stroke:${c(color)}}`
            ], colors));
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

const mapStateToProps = state => ({
  companySvgLogos: state.config.companySvgLogos
});

export default connect(mapStateToProps)(SetSvgColors);
