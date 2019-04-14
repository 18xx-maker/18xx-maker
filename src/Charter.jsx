import React from "react";
import * as R from "ramda";
import Token from "./Token";
import Phase from "./Phase";
import Color from "./data/Color";
import ColorContext from "./context/ColorContext";

import is from "ramda/src/is";

const Charter = ({ name, abbrev, token, tokens, phases, turns }) => {
  let color = token;
  if(is(Object, token)) {
    color = token.colors[0];
  }

  let tokenSpots = R.addIndex(R.map)((label, index) => {
    return (
      <svg key={`token-${index}`}>
        <g transform={`translate(25 25)`}>
          <ColorContext.Provider value="companies">
            <Token label={abbrev} token={token} />
          </ColorContext.Provider>
          <g transform={`translate(0 39)`}>
            <text fontSize="10" textAnchor="middle">
              {label}
            </text>
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
      {c => (
        <div className="cutlines">
          <div className="charter">
            <div className="charter__name">{name}</div>
            <div className="charter__tokens">{tokenSpots}</div>
            <div
              className="charter__hr"
              style={{ backgroundColor: c(color) }}
            />
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
            <div
              className="charter__hr"
              style={{ backgroundColor: c(color) }}
            />
          </div>
        </div>
      )}
    </Color>
  );
};

export default Charter;
