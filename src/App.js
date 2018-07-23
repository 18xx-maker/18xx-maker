import React, { Component } from "react";

import "./App.css";

import Tiles from "./Tiles";
import SingleTile from "./SingleTile";
import Atoms from "./atoms";
import Positioning from "./Positioning";

import Background from "./Background";
import Charters from "./Charters";
import MapPaginated from "./MapPaginated";
import MapSingle from "./MapSingle";
import Home from "./Home";
import Game from "./Game";
import IPO from "./IPO";
import Privates from "./Privates";
import Revenue from "./Revenue";
import Shares from "./Shares";
import Stock from "./Stock";
import Trains from "./Trains";
import Tokens from "./Tokens";
import TileSheet from "./TileSheet";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/tiles" component={Tiles} />
            <Route path="/tiles/atoms" component={Atoms} />
            <Route path="/tiles/positioning" component={Positioning} />
            <Route path="/tiles/:id" component={SingleTile} />
            <Route exact path="/:game" component={Game} />
            <Route path="/:game/background" component={Background} />
            <Route path="/:game/charters" component={Charters} />
            <Route path="/:game/ipo" component={IPO} />
            <Route exact path="/:game/map" component={MapSingle} />
            <Route path="/:game/map-paginated" component={MapPaginated} />
            <Route path="/:game/privates" component={Privates} />
            <Route path="/:game/revenue" component={Revenue} />
            <Route path="/:game/shares" component={Shares} />
            <Route path="/:game/stock" component={Stock} />
            <Route path="/:game/tiles" component={TileSheet} />
            <Route path="/:game/tokens" component={Tokens} />
            <Route path="/:game/trains" component={Trains} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
