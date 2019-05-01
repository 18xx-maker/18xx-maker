import carth from "./themes/carth";
import dtg from "./themes/dtg";
import gmt from "./themes/gmt";
import ps18xx from "./themes/ps18xx";

import * as tinycolor from "tinycolor2";

import curry from "ramda/es/curry";
import is from "ramda/es/is";
import mergeDeepRight from "ramda/es/mergeDeepRight";

import ColorContext from '../context/ColorContext';
import GameContext from '../context/GameContext';
import PhaseContext from '../context/PhaseContext';

import React from 'react';
import { connect } from 'react-redux';

import games from "./games";

const schemes = {
  carth,
  dtg,
  gmt,
  ps18xx
};

const resolveColor = curry((scheme, phase, context, game, name) => {
  let colors = schemes[scheme || "gmt"] || schemes["gmt"];

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

const textColor = curry((scheme, phase, game, color) => {
  let text = [resolveColor(scheme, phase, null, game, "white"),
              resolveColor(scheme, phase, null, game, "black")];
  let tc = tinycolor(color);
  return tinycolor.mostReadable(tc, text).toRgbString();
});

const strokeColor = color => tinycolor(color).darken(10).toString();

const Color = ({ scheme, context, children }) => {
  return (
    <GameContext.Consumer>
      {gameContext => {
        let game = games[gameContext];
        return (
          <ColorContext.Consumer>
            {colorContext => (
              <PhaseContext.Consumer>
                {phase => {
                  let c = resolveColor(scheme, phase, context || colorContext, game);
                  let p = resolveColor(scheme, phase, undefined, game);
                  let t = textColor(scheme, phase, game);
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
      }}
    </GameContext.Consumer>
  );
};

const mapStateToProps = state => ({
  scheme: state.config.scheme
});

const connectScheme = connect(mapStateToProps);
const connectedColor = connectScheme(Color);
export default connectedColor;
