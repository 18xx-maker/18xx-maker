import React from "react";
import Charter from "./Charter";
import games from "./data/games";
import util from "./util";
import * as R from "ramda";

const Charters = ({ match }) => {
  let game = games[match.params.game];
  let companies = game.companies;

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
          />
        );
      }, companies)}
    </div>
  );
};

export default Charters;
