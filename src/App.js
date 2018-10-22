import React, { Component } from "react";

import "./App.css";

import * as R from "ramda";
import { fonts } from "./data";

import Tiles from "./Tiles";
import SingleTile from "./SingleTile";
import Atoms from "./atoms";
import Positioning from "./Positioning";

import Background from "./Background";
import Cards from "./Cards";
import Charters from "./Charters";
import Minors from "./Minors";
import Home from "./Home";
import IPO from "./IPO";
import Revenue from "./Revenue";
import Tokens from "./Tokens";

import TileSheet from "./TileSheet";
import TileManifest from "./TileManifest";

import MapPaginated from "./MapPaginated";
import MapSingle from "./MapSingle";

import Stock from "./Stock";
import StockPaginated from "./StockPaginated";

import GameMenu from "./GameMenu";

import Footer from "./Footer";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

class App extends Component {
  render() {
    let fontLinks = R.map(
      font => (
        <link
          key={font}
          href={`https://fonts.googleapis.com/css?family=${font}`}
          rel="stylesheet"
        />
      ),
      fonts
    );
    return (
      <Router>
        <div className="App">
          {fontLinks}
          <Switch>
            <Route exact path="/" component={Home} />

            <Route exact path="/tiles" component={Tiles} />
            <Route path="/tiles/atoms" component={Atoms} />
            <Route path="/tiles/positioning" component={Positioning} />
            <Route path="/tiles/:id" component={SingleTile} />

            <Route path="/:game/background" component={Background} />
            <Route path="/:game/cards" component={Cards} />
            <Route path="/:game/charters" component={Charters} />
            <Route path="/:game/minors" component={Minors} />
            <Route path="/:game/ipo" component={IPO} />
            <Route exact path="/:game/map" component={MapSingle} />
            <Route exact path="/:game/map-paginated" component={MapPaginated} />
            <Route path="/:game/map/:variation" component={MapSingle} />
            <Route
              path="/:game/map-paginated/:variation"
              component={MapPaginated}
            />
            <Route path="/:game/revenue" component={Revenue} />
            <Route exact path="/:game/stock" component={Stock} />
            <Route path="/:game/stock-paginated" component={StockPaginated} />
            <Route path="/:game/tiles" component={TileSheet} />
            <Route path="/:game/manifest" component={TileManifest} />
            <Route path="/:game/tokens" component={Tokens} />
          </Switch>

          <Switch>
            <Route path="/tiles" component={GameMenu} />
            <Route path="/:game/" component={GameMenu} />
          </Switch>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
