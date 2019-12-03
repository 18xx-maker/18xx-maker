import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";

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
          <Redirect to="/tiles/yellow" />
        </Route>
        <Route path="/tiles/yellow">
          <Tiles color="yellow" />
        </Route>
        <Route path="/tiles/green">
          <Tiles color="green" />
        </Route>
        <Route path="/tiles/brown">
          <Tiles color="brown" />
        </Route>
        <Route path="/tiles/gray">
          <Tiles color="gray" />
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
