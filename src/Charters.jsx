import React from "react";
import Charter from "./Charter";
import games from "./data/games";
import * as R from "ramda";

const Charters = ({ match }) => {
  let game = games[match.params.game];
  let companies = game.companies;

  if(!companies) {
    return null;
  }

  return (
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
      <style>{`@media print {@page {size: 8.5in 11in;}}`}</style>
    </div>
  );
};

export default Charters;
