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
    <div class="charters">
      {R.addIndex(R.chain)((company, index) => {
        return (
          <Charter
            name={company.name}
            abbrev={company.abbrev}
            color={company.color}
            tokens={company.tokens}
            phases={game.phases}
            turns={game.turns}
          />
        );
      }, companies)}
    </div>
  );
};

export default Charters;
