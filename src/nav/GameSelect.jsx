import React from "react";
import {withRouter} from "react-router";

import assoc from "ramda/src/assoc";
import compose from "ramda/src/compose";
import map from "ramda/src/map";
import mapObj from "ramda/src/mapObjIndexed";
import path from "ramda/src/path";
import sortBy from "ramda/src/sortBy";
import values from "ramda/src/values";

import games from "../data/games";

const emptyGame = <option key="None" value="">Select</option>;
const makeGameNode = game => (
  <option key={game.id}
          value={game.id}>
    {game.info.title}
  </option>
);

const GameSelect = ({match,history,location}) => {
  let name = match.params.game;
  let game = games[name];
  let selection = "map";
  if (game) {
    selection = location.pathname.split('/')[2];
  }

  let handleChange = event => {
    if(event.target.value !== name) {
      history.push(`/${event.target.value}/${selection}`);
    }
  };

  let gameNodes = compose(map(makeGameNode),
                          sortBy(path(["info","title"])),
                          values,
                          mapObj((game, id) => assoc("id", id, game)))(games);

  if (!game) {
    gameNodes.unshift(emptyGame);
  }

  return (
    <div className="select">
      <h3>Game</h3>
      <select onChange={handleChange}
              value={name}>
        {gameNodes}
      </select>
    </div>
  );
}

export default withRouter(GameSelect);
