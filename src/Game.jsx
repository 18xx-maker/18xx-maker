import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import GameContext from "./context/GameContext";

import games from "./data/games";

import About from "./About";
import Background from "./Background";
import Cards from "./cards";
import Charters from "./Charters";
import IPO from "./IPO";
import Revenue from "./Revenue";
import Tokens from "./Tokens";

import MapPaginated from "./map/MapPaginated";
import MapSingle from "./map/MapSingle";

import Stock from "./Stock";
import StockPaginated from "./StockPaginated";

import TileSheet from "./TileSheet";
import TileManifest from "./TileManifest";

import B18Map from "./b18/Map";
import B18Tiles from "./b18/Tiles";
import B18Tokens from "./b18/Tokens";

const Game = ({ match }) => {
  let game = games[match.params.game];

  if (!game) {
    return <Redirect to="/" />;
  }

  return (
    <GameContext.Provider value={match.params.game}>
      {game.wip && (
        <div className="WIP">
          <div>
            <p>This game is a work in progress. It is not fully implemented</p>
          </div>
        </div>
      )}
      <Switch>
        <Route path="/:game/background" component={Background} />
        <Route path="/:game/cards" component={Cards} />
        <Route path="/:game/charters" component={Charters} />
        <Route path="/:game/ipo" component={IPO} />
        <Route path="/:game/map" exact component={MapSingle} />
        <Route path="/:game/map-paginated" exact component={MapPaginated} />
        <Route path="/:game/map/:variation" component={MapSingle} />
        <Route path="/:game/map-paginated/:variation" component={MapPaginated} />
        <Route path="/:game/market" exact component={Stock} />
        <Route path="/:game/market-paginated" component={StockPaginated} />
        <Route path="/:game/revenue" component={Revenue} />
        <Route path="/:game/tile-manifest" component={TileManifest} />
        <Route path="/:game/tiles" component={TileSheet} />
        <Route path="/:game/tokens" component={Tokens} />

        <Route path="/:game/b18-map" component={B18Map} />
        <Route path="/:game/b18-tiles-:color" component={B18Tiles} />
        <Route path="/:game/b18-tokens" component={B18Tokens} />
        <Route component={About} />
      </Switch>
    </GameContext.Provider>
  );
};

export default Game;
