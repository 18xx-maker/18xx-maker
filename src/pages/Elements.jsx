import React from "react";
import { Route, Switch } from "react-router-dom";

import Atoms from "./elements/Atoms";
import Logos from "./elements/Logos";
import Tiles from "./elements/Tiles";

import defaultGame from "../data/games/1889.json";
import GameContext from "../context/GameContext";

const Elements = () => {
  return (
    <GameContext.Provider value={{game: defaultGame}}>
      <Switch>
        <Route path="/elements/tiles" exact>
          <Tiles/>
        </Route>
        <Route path="/elements/logos" exact>
          <Logos/>
        </Route>
        <Route>
          <Atoms/>
        </Route>
      </Switch>
    </GameContext.Provider>
  );
};

export default Elements;
