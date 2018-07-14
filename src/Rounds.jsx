import React from "react";
import Token from "./Token";
import * as R from "ramda";

const Rounds = ({ rounds }) => {
  let items = R.map(
    round => (
      <svg key={round.name}>
        <Token label={round.name} color={round.color} labelColor="black" />
      </svg>
    ),
    rounds
  );
  return <div className="rounds"><div className="tokens">{items}</div></div>;
};

export default Rounds;
