import React from "react";
import { connect } from "react-redux";

import ColorContext from "../context/ColorContext";
import Color from "./Color";

import concat from "ramda/src/concat";
import keys from "ramda/src/keys";
import reduce from "ramda/src/reduce";

const colors = keys(require("./themes/companies/rob.json"));

const SetSvgColors = ({ overrideSvgLogoColors }) => {
  if (!overrideSvgLogoColors) return null;

  return (
    <ColorContext.Provider value="companies">
      <Color>
        {c => {
          let css = reduce((css, color) => {
            return concat(css, `svg .color-${color}{fill:${c(color)}} svg .color-stroke-${color}{stroke:${c(color)}} `);
          },
                           "", colors);

          return (
            <style>{css}</style>
          );
        }}
      </Color>
    </ColorContext.Provider>
  );
}

const mapStateToProps = state => ({
  overrideSvgLogoColors: state.config.overrideSvgLogoColors
});

export default connect(mapStateToProps)(SetSvgColors);
