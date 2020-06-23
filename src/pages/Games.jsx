import React from "react";
import { Route, Switch } from "react-router-dom";

import LoadGames from "../games/LoadGames";

import { useGame } from "../context/GameContext";

import Game from "./games/Game";

const Games = () => {
  const { game } = useGame();

  return (
    <Switch>
      <Route path="/games" exact>
        <LoadGames/>
      </Route>
      <Route>
        <Game game={game}/>
      </Route>
    </Switch>
  );
};

export default Games;
