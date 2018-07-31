import React from "react";
import Private from "./Private";
import games from "./data/games";
import * as R from "ramda";

const Privates = ({ match }) => {
  let game = games[match.params.game];
  let privates = game.privates;

  if (!privates) {
    return null;
  }

  return (
    <div className="cards">
      <div className="PrintNotes">
        Privates are meant to be printed in <b>landscape</b> mode
      </div>
      {R.addIndex(R.map)(
        (p, i) => <Private key={`private-${match.params.game}-${i}`} {...p} />,
        privates
      )}
    </div>
  );
};

export default Privates;
