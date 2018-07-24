import React from "react";
import Token from "./Token";
import * as R from "ramda";

const Rounds = ({ rounds }) => {
  let items = R.addIndex(R.map)(
    (round, index) => (
      <div className="Token">
        <svg viewBox="-25 -25 50 50" key={round.name}>
          <Token
            width="25"
            label={round.name}
            color={round.color}
            labelColor="black"
          />
        </svg>
        {index > 0 && <i className="fal fa-arrow-up" />}
      </div>
    ),
    rounds
  );
  return (
    <div className="rounds">
      <div className="tokens">{items}</div>
    </div>
  );
};

export default Rounds;
