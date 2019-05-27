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
  if (companySvgLogos === "none" || companySvgLogos === "original") return null;

  return (
    <ColorContext.Provider value="companies">
      <Color>
        {c => {
          let rules = chain(color => [
            `svg .color-${color}{fill:${c(color)}}`,
            `svg .color-stroke-${color}{stroke:${c(color)}}`
          ], colors);

          if (companySvgLogos === "main") {
            rules = concat(rules, chain(color => [
              `svg .color-main-${color} .color-main{fill:${c(color)}}`,
              `svg .color-main-${color} .color-stroke-main{stroke:${c(color)}}`,
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
