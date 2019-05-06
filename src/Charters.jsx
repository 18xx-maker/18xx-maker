import React from "react";
import Charter from "./Charter";
import games from "./data/games";
import * as R from "ramda";

import GameContext from "./context/GameContext";
import PageSetup from "./PageSetup";

const Charters = ({ match }) => {
  let game = games[match.params.game];
  let companies = game.companies;

  if(!companies) {
    return null;
  }

  return (
    <GameContext.Provider value={match.params.game}>
      <div className="charters">
        <div className="PrintNotes">
          <div>
            <p>
              Charters are meant to be printed in <b>portait</b> mode
            </p>
          </div>
        </div>
        {R.addIndex(R.chain)((company, index) => {
          return (
            <Charter
              key={company.abbrev}
              name={company.name}
              abbrev={company.abbrev}
              token={company.token || company.color}
              tokens={company.tokens}
              phases={game.phases}
              turns={game.turns}
            />
          );
        }, companies)}
        <PageSetup landscape={false}/>
      </div>
    </GameContext.Provider>
  );
};

export default Charters;
