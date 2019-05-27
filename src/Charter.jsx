import React from "react";
import { connect } from "react-redux";
import * as R from "ramda";
import Token from "./Token";
import Phase from "./Phase";
import Color from "./data/Color";
import ColorContext from "./context/ColorContext";
import { unitsToCss } from "./util";

import is from "ramda/src/is";

const Charter = ({ name, abbrev, token, tokens, phases, turns, charterStyle, game, halfWidthCharters }) => {
  let color = token;
  if(is(Object, token)) {
    color = token.colors[0];
  }

  let tokenSpots = R.addIndex(R.map)((label, index) => {
    return (
      <svg key={`token-${index}`}>
        <g transform={`translate(25 25)`}>
          <ColorContext.Provider value="companies">
            <Token outline={charterStyle === "color" ? "black" : null}
                   label={charterStyle === "color" ? null : abbrev}
                   token={charterStyle === "color" ? null : token} />
          </ColorContext.Provider>
          <g transform={`${halfWidthCharters ? "rotate(-90) " : ""}translate(0 39)`}>
            <Color context="companies">
              {(c, t) => (
                <text fill={(charterStyle === "color" && !halfWidthCharters) ? t(c(color)) : c("black")}
                      fontSize="11" fontWeight="normal" textAnchor="middle">
                  {label}
                </text>
              )}
            </Color>
          </g>
        </g>
      </svg>
    );
  }, tokens);

  let turnNodes = R.chain(turn => {
    let steps = R.addIndex(R.map)((step, i) => {
      return <li key={i}><span>{step}</span></li>;
    }, turn.steps);

    let stepsList = turn.ordered ? <ol>{steps}</ol> : <ul>{steps}</ul>;

    let optionals = R.addIndex(R.map)((step, i) => {
      return <li key={i}><span>{step}</span></li>;
    }, turn.optional || []);
    let optionalList = <ul>{optionals}</ul>;

    return (
      <React.Fragment key={`turn-${turn.name}`}>
        <dt>{turn.name}</dt>
        <dd>{stepsList}</dd>
        {turn.optional && <dd>{optionalList}</dd>}
      </React.Fragment>
    );
  }, turns);

  return (
    <Color context="companies">
      {(c, t) => (
        <div className="cutlines">
          <div className={`charter charter--${charterStyle}${halfWidthCharters ? " charter--half" : ""}`}>
            <div
              className="charter__hr"
              style={{ backgroundColor: c(color) }}
            />
            <div style={{ color: t(c(charterStyle === "color" ? color : "white")),
                          paddingRight: halfWidthCharters ? null : unitsToCss(25 + (65 * tokens.length)) }}
                 className="charter__name"><div>{name}</div></div>
            {charterStyle === "color" && (
              <div className="charter__logo">
                <svg viewBox="-37.5 -37.5 75 75">
                  <ColorContext.Provider value="companies">
                    <Token outline="white"
                           label={abbrev}
                           width={37.5}
                           token={token} />
                  </ColorContext.Provider>
                </svg>
              </div>
            )}
            {false && <div className="charter__game">{game}</div>}
            <div className="charter__tokens">
              {halfWidthCharters && "Tokens"}
              {tokenSpots}
            </div>
            {halfWidthCharters && (
              <div className="charter__assets">
                Assets
                <dl>{turnNodes}</dl>
              </div>
            )}
            {halfWidthCharters || (
              <div className="charter__trains">
                Trains
                <div className="charter__phase">
                  <Phase phases={phases} />
                </div>
              </div>
            )}
            {halfWidthCharters || (
              <div className="charter__treasury">
                Treasury
                <dl>{turnNodes}</dl>
              </div>
            )}
          </div>
        </div>
      )}
    </Color>
  );
};

const mapStateToProps = state => ({
  charterStyle: state.config.charterStyle,
  halfWidthCharters: state.config.halfWidthCharters
});

export default connect(mapStateToProps)(Charter);
