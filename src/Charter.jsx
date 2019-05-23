import React from "react";
import { connect } from "react-redux";
import * as R from "ramda";
import Token from "./Token";
import Phase from "./Phase";
import Color from "./data/Color";
import ColorContext from "./context/ColorContext";

import is from "ramda/src/is";

const Charter = ({ name, abbrev, token, tokens, phases, turns, charterLayout }) => {
  let color = token;
  if(is(Object, token)) {
    color = token.colors[0];
  }

  let tokenSpots = R.addIndex(R.map)((label, index) => {
    return (
      <svg key={`token-${index}`}>
        <g transform={`translate(25 25)`}>
          <ColorContext.Provider value="companies">
            <Token outline={charterLayout === "color" ? "black" : null}
                   label={charterLayout === "color" ? null : abbrev}
                   token={charterLayout === "color" ? null : token} />
          </ColorContext.Provider>
          <g transform={`translate(0 39)`}>
            <Color context="companies">
              {(c, t) => (
                <text fill={charterLayout === "color" ? t(c(color)) : null}
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
          <div className={`charter charter--${charterLayout}`}>
            <div
              className="charter__hr"
              style={{ backgroundColor: c(color) }}
            />
            <div style={{ color: t(c(charterLayout === "color" ? color : "white")) }}
                 className="charter__name">{name}</div>
            {charterLayout === "color" && (
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
            <div className="charter__tokens">{tokenSpots}</div>
            <div className="charter__trains">
              Trains
              <div className="charter__phase">
                <Phase phases={phases} />
              </div>
            </div>
            <div className="charter__treasury">
              Treasury
              <dl>{turnNodes}</dl>
            </div>
          </div>
        </div>
      )}
    </Color>
  );
};

const mapStateToProps = state => ({
  charterLayout: state.config.charterLayout
});

export default connect(mapStateToProps)(Charter);
