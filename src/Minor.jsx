import React from "react";
import { colors } from "./data";
import * as R from "ramda";
import Token from "./Token";
import Phase from "./Phase";

const Minor = ({ name, abbrev, color, tokens, minorPhases, turns }) => {
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

  return (
    <div className="cutlines">
      <div className="minorCharter">
        <div className="minorCharter__name">{name}</div>
        <div className="minorCharter__tokens">{tokenSpots}</div>
        <div
          className="minorCharter__hr"
          style={{ backgroundColor: colors[color] }}
        />
        <div className="minorCharter__trains">
          Trains
          <div className="minorCharter__phase">
            <Phase phases={minorPhases} />
          </div>
        </div>
        <div className="minorCharter__treasury">
          Treasury
        </div>
        <div
          className="minorCharter__hr"
          style={{ backgroundColor: colors[color] }}
        />
      </div>
    </div>
  );
};

export default Minor;
