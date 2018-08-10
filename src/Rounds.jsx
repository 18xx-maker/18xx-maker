import React from "react";
import Token from "./Token";
import * as R from "ramda";

const Rounds = ({ rounds, horizontal }) => {
  let classes = "rounds";
  if(horizontal) {
    classes = `${classes} rounds--horizontal`;
  }

  let arrow = horizontal ? "right" : "up";

  let items = R.addIndex(R.map)(
    (round, index) => (
      <div key={`token-${index}`} className="Token">
        <svg viewBox="-25 -25 50 50" key={round.name}>
          <Token
            label={round.name}
            color={round.color}
            labelColor="black"
          />
        </svg>
        {index > 0 && <i className={`fal fa-arrow-${arrow}`} />}
      </div>
    ),
    rounds
  );
  return (
    <div className={classes}>
      <div className="tokens">{items}</div>
    </div>
  );
};

export default Rounds;
