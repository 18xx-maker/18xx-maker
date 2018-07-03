import React from "react";
import Token from "./Token";
import * as R from "ramda";
import { colors } from "./data";

const Rounds = ({ rounds }) => {
  let items = R.map(
    round => (
      <svg>
        <Token width={25} label={round.name} color={colors[round.color]} />
      </svg>
    ),
    rounds
  );
  return <div class="rounds"><h2>Rounds</h2>{items}</div>;
};

export default Rounds;
