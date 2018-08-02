import React, { Component } from "react";

import "./App.css";

import Tiles from "./Tiles";
import SingleTile from "./SingleTile";
import Atoms from "./atoms";
import Positioning from "./Positioning";

import Background from "./Background";
import Cards from "./Cards";
import Charters from "./Charters";
import Home from "./Home";
import IPO from "./IPO";
import Revenue from "./Revenue";
import Stock from "./Stock";
import Tokens from "./Tokens";

import TileSheet from "./TileSheet";
import TileManifest from "./TileManifest";

import MapPaginated from "./MapPaginated";
import MapSingle from "./MapSingle";

import GameMenu from "./GameMenu";

import Footer from "./Footer";

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

            <Route path="/:game/background" component={Background} />
            <Route path="/:game/cards" component={Cards} />
            <Route path="/:game/charters" component={Charters} />
            <Route path="/:game/ipo" component={IPO} />
            <Route exact path="/:game/map" component={MapSingle} />
            <Route path="/:game/map/:variation" component={MapSingle} />
            <Route exact path="/:game/map-paginated" component={MapPaginated} />
            <Route path="/:game/map-paginated/:variation" component={MapPaginated} />
            <Route path="/:game/revenue" component={Revenue} />
            <Route path="/:game/stock" component={Stock} />
            <Route path="/:game/tiles" component={TileSheet} />
            <Route path="/:game/manifest" component={TileManifest} />
            <Route path="/:game/tokens" component={Tokens} />
          </Switch>

          <Switch>
            <Route path="/tiles" component={GameMenu} />
            <Route path="/:game/" component={GameMenu} />
          </Switch>
          <Footer/>
        </div>
      </Router>
    );
  }
}

export default App;
