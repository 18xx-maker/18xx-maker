import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import LoadGames from "../games/LoadGames";

import { useGame } from "../context/GameContext";

import Game from "./games/Game";

const Games = () => {
  const { game } = useGame();

  return (
    <Switch>
      <Route path="/games" exact>
        {game ? <Redirect to={`/games/${game.slug}/map`}/> : <LoadGames/>}
      </Route>
      <Route>
        {game ? <Game game={game}/> : <Redirect to="/games"/>}
      </Route>
    </Switch>
  );
};

export default Games;
