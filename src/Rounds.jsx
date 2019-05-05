import React from "react";
import Token from "./Token";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

const Rounds = ({ rounds, horizontal }) => {
  let classes = "rounds";
  if(horizontal) {
    classes = `${classes} rounds--horizontal`;
  }

  let arrow = horizontal ? "right" : "up";

  let items = addIndex(map)(
    (round, index) => (
      <div key={`token-${index}`} className="Token">
        <svg viewBox="-25 -25 50 50" key={round.name}>
          <Token
            label={round.name}
            token={round.color}
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
