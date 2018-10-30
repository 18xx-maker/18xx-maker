import React from "react";
import Minor from "./Minor";
import games from "./data/games";
import * as R from "ramda";

const Minors = ({ match }) => {
  let game = games[match.params.game];
  let minorCompanies = game.minorCompanies;

  if(!minorCompanies) {
    return null;
  }

  return (
    <div className="charters">
      {R.addIndex(R.chain)((company, index) => {
        return (
          <Minor
            key={company.abbrev}
            name={company.name}
            abbrev={company.abbrev}
            color={company.color}
            tokens={company.tokens}
            minorPhases={game.minorPhases}
            turns={game.turns}
          />
        );
      }, minorCompanies)}
      <div className="PrintNotes">
        Minors are meant to be printed in <b>landscape</b> mode
      </div>
    </div>
  );
};

export default Minors;
