import React from "react";
import Private from "./Private";
import games from "./data/games";
import util from "./util";
import * as R from "ramda";

const Privates = ({ match }) => {
  let game = games[match.params.game];
  let privates = game.privates;

  if(!privates) {
    return null;
  }

  return (
    <div class="cards">
      {R.map(
        p => (
          <Private
            name={p.name}
            price={p.price}
            revenue={p.revenue}
            description={p.description}
          />
        ),
        privates
      )}
    </div>
  );
};

export default Privates;
