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
        <Route path="/tiles" exact render={() => <Redirect to="/tiles/yellow"/>}/>
        <Route path="/tiles/yellow" render={() => <Tiles color="yellow"/>}/>
        <Route path="/tiles/green" render={() => <Tiles color="green"/>}/>
        <Route path="/tiles/brown" render={() => <Tiles color="brown"/>}/>
        <Route path="/tiles/gray" render={() => <Tiles color="gray"/>}/>
        <Route path="/tiles/atoms" component={Atoms}/>
        <Route path="/tiles/positioning" component={Positioning}/>
      </Switch>
    </>
  );
};

export default TilesIndex;
