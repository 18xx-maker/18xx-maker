import React from "react";
import { Switch, Redirect, Route } from "react-router";

import Background from "./Background";

// import Container from "@material-ui/core/Container";
// import Typography from "@material-ui/core/Typography";

const Game = ({game}) => {
  if (!game) {
    return null;
  }

  return (
    <Switch>
      <Route path="/games/:slug/background">
        <Background/>
      </Route>
      <Redirect to={`/games/${game.slug}/background`}/>
    </Switch>
  )
};

export default Game;
