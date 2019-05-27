import React from "react";
import Minor from "./Minor";
import games from "./data/games";
import * as R from "ramda";

import PageSetup from "./PageSetup";

const Minors = ({ match }) => {
  let game = games[match.params.game];
  let minorCompanies = game.minorCompanies;

  if(!minorCompanies) {
    return null;
  }

  return (
    <div className="charters">
      {R.addIndex(R.chain)((minor, index) => {
        return (
          <Minor
            key={minor.abbrev}
            name={minor.name}
            abbrev={minor.abbrev}
            color={minor.color}
            tokens={minor.tokens}
            minorPhases={game.minorPhases}
            turns={game.turns}
          />
        );
      }, minorCompanies)}
      <div className="PrintNotes">
        Minors are meant to be printed in <b>landscape</b> mode
      </div>
      <PageSetup landscape={true}/>
    </div>
  );
};

export default Minors;
