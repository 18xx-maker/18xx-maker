import React, { Component } from "react";

import "./App.css";

import SVG from "./Svg";

import Tiles from "./Tiles";
import Atoms from "./Atoms";

import Charters from "./Charters";
import Home from "./Home";
import Game from "./Game";
import Privates from "./Privates";
import Shares from "./Shares";
import Stock from "./Stock";
import Trains from "./Trains";
import Tokens from "./Tokens";

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
            <Route exact path="/:game" component={Game} />
            <Route path="/:game/tiles" component={SVG} />
            <Route path="/:game/trains" component={Trains} />
            <Route path="/:game/tokens" component={Tokens} />
            <Route path="/:game/shares" component={Shares} />
            <Route path="/:game/charters" component={Charters} />
            <Route path="/:game/privates" component={Privates} />
            <Route path="/:game/stock" component={Stock} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
