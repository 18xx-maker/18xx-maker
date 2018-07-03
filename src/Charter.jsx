import React from "react";
import { colors, textColor } from "./data";
import * as R from "ramda";
import Token from "./Token";
import Phase from "./Phase";

const Charter = ({ name, abbrev, color, tokens, phases }) => {
  let tokenSpots = R.addIndex(R.map)((token, index) => {
    return (
      <svg>
        <g transform={`translate(25 25)`}>
          <Token label={abbrev} color={color} width={25} inverse={true} />
          <g transform={`translate(0 43)`}>
            <text textAnchor="middle">{token}</text>
          </g>
        </g>
      </svg>
    );
  }, tokens);
  return (
    <div class="cutlines">
      <div class="charter">
        <div class="charter__name">{name}</div>
        <div class="charter__tokens">{tokenSpots}</div>
        <div class="charter__hr" style={{ backgroundColor: color }} />
        <div class="charter__trains">
          Trains
          <div class="charter__phase">
            <Phase phases={phases} />
          </div>
        </div>
        <div class="charter__treasury">Treasury</div>
        <div class="charter__hr" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
};

export default Charter;
