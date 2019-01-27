import React from "react";
import {withRouter} from "react-router";

import assoc from "ramda/es/assoc";
import compose from "ramda/es/compose";
import map from "ramda/es/map";
import mapObj from "ramda/es/mapObjIndexed";
import path from "ramda/es/path";
import sortBy from "ramda/es/sortBy";
import values from "ramda/es/values";

import games from "../data/games";

const makeGameNode = game => (
  <option key={game.id}
          value={game.id}>
    {game.info.title}
  </option>
);

const GameSelect = ({match,history,location}) => {
  let gameName = match.params.game;

  let handleChange = event => {
    if(event.target.value !== gameName) {
      history.push(`/${event.target.value}/map`);
    }
  };

  let gameNodes = compose(map(makeGameNode),
                          sortBy(path(["info","title"])),
                          values,
                          mapObj((game, id) => assoc("id", id, game)))(games);

  return (
    <div className="select">
      <h3>Game</h3>
      <select onChange={handleChange}
              value={gameName}>
        {gameNodes}
      </select>
    </div>
  );
}

export default withRouter(GameSelect);
