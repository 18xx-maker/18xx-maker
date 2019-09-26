import React from "react";
import { Redirect, useParams } from "react-router-dom";
import Charter from "./Charter";
import games from "./data/games";
import * as R from "ramda";

import GameContext from "./context/GameContext";
import PageSetup from "./PageSetup";

const Charters = () => {
  let params = useParams();
  let game = games[params.game];

  if (!game.companies) {
    return <Redirect to={`/${params.game}/background`} />;
  }

  let companies = game.companies;

  return (
    <GameContext.Provider value={params.game}>
      <div className="charters">
        <div className="PrintNotes">
          <div>
            <p>
              Charters are meant to be printed in <b>portait</b> mode
            </p>
          </div>
        </div>
        {R.addIndex(R.chain)((company, index) => {
          if (company.minor && game.minorPhases) {
            return (
              <Charter
                game={game.info.title}
                key={company.abbrev}
                name={company.name}
                abbrev={company.abbrev}
                token={company.token || company.color}
                tokens={company.tokens}
                phases={game.minorPhases}
                turns={game.turns}
              />
            );
          } else {
            return (
              <Charter
                game={game.info.title}
                key={company.abbrev}
                name={company.name}
                abbrev={company.abbrev}
                token={company.token || company.color}
                tokens={company.tokens}
                phases={game.phases}
                turns={game.turns}
              />
            );
          }
        }, companies)}
        <PageSetup landscape={false}/>
      </div>
    </GameContext.Provider>
  );
};

export default Charters;
