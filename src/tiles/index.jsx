import React from "react";

import { Route, Switch } from "react-router-dom";

import TileNav from "../nav/Tiles";
import Tiles from "./Tiles";
import Atoms from "../atoms";
import Positioning from "./Positioning";

const TilesIndex = () => {
  return (
    <>
      <div className="PrintNotes">
        <div>
          <TileNav/>
        </div>
      </div>
      <Switch>
        <Route path="/tiles" exact>
          <Tiles />
        </Route>
        <Route path="/tiles/atoms">
          <Atoms />
        </Route>
        <Route path="/tiles/positioning">
          <Positioning />
        </Route>
      </Switch>
    </>
  );
};

export default TilesIndex;
