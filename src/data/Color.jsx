import carth from "./themes/carth";
import dtg from "./themes/dtg";
import gmt from "./themes/gmt";
import kelsin from "./themes/kelsin";
import ps18xx from "./themes/ps18xx";

import * as tinycolor from "tinycolor2";

import curry from "ramda/es/curry";
import is from "ramda/es/is";

import ColorContext from '../context/ColorContext';
import PhaseContext from '../context/PhaseContext';

import React from 'react';
import { connect } from 'react-redux';

const schemes = {
  carth,
  dtg,
  gmt,
  kelsin,
  ps18xx
};

const resolveColor = curry((scheme, phase, context, name) => {
  let colors = schemes[scheme || "gmt"] || schemes["gmt"];

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

const textColor = curry((scheme, phase, context, color) => {
  let text = [resolveColor(scheme, phase, context, "white"),
              resolveColor(scheme, phase, context, "black")];
  let tc = tinycolor(color);
  return tinycolor.mostReadable(tc, text).toRgbString();
});

const strokeColor = color => tinycolor(color).darken(10).toString();

const Color = ({ scheme, context, children }) => {
  return (
    <ColorContext.Consumer>
      {colorContext => (
        <PhaseContext.Consumer>
          {phase => {
            let c = resolveColor(scheme, phase, context || colorContext);
            let t = textColor(scheme, phase, context || colorContext);
            let s = strokeColor;

            return (
              <React.Fragment>
                {children(c, t, s)}
              </React.Fragment>
            );
          }}
        </PhaseContext.Consumer>
      )}
    </ColorContext.Consumer>
  );
};

const mapStateToProps = state => ({
  scheme: state.config.scheme
});

const connectScheme = connect(mapStateToProps);
const connectedColor = connectScheme(Color);
export default connectedColor;
