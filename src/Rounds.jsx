import React from "react";
import Token from "./Token";
import * as R from "ramda";
import { colors } from "./data";

const Rounds = ({ rounds }) => {
  let items = R.map(
    round => (
      <svg>
        <Token label={round.name} color={round.color} labelColor="black" />
      </svg>
    ),
    rounds
  );
  return <div class="rounds"><div class="tokens">{items}</div></div>;
};

export default Rounds;
