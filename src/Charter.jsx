import React from "react";
import { colors } from "./data";
import * as R from "ramda";
import Token from "./Token";
import Phase from "./Phase";

const Charter = ({ name, abbrev, color, tokens, phases, turns }) => {
  let tokenSpots = R.addIndex(R.map)((token, index) => {
    return (
      <svg key={`token-${index}`}>
        <g transform={`translate(25 25)`}>
          <Token label={abbrev} color={color} />
          <g transform={`translate(0 39)`}>
            <text fontSize="10" textAnchor="middle">
              {token}
            </text>
          </g>
        </g>
      </svg>
    );
  }, tokens);

  let turnNodes = R.chain(turn => {
    let steps = R.addIndex(R.map)((step, i) => {
      return <li key={i}>{step}</li>;
    }, turn.steps);

    let stepsList = turn.ordered ? <ol>{steps}</ol> : <ul>{steps}</ul>;

    return (
      <React.Fragment>
        <dt>{turn.name}</dt>
        <dd>{stepsList}</dd>
      </React.Fragment>
    );
  }, turns);

  return (
    <div className="cutlines">
      <div className="charter">
        <div className="charter__name">{name}</div>
        <div className="charter__tokens">{tokenSpots}</div>
        <div
          className="charter__hr"
          style={{ backgroundColor: colors[color] }}
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
          style={{ backgroundColor: colors[color] }}
        />
      </div>
    </div>
  );
};

export default Charter;
