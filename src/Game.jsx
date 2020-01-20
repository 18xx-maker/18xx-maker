import React from "react";
import { Redirect, Route, Switch, useParams } from "react-router-dom";

import GameContext from "./context/GameContext";

import games from "./data/games";

import About from "./About";
import Background from "./Background";
import BankPool from "./BankPool";
import Cards from "./cards";
import Charters from "./Charters";
import IPO from "./IPO";
import Tokens from "./Tokens";

import MapPaginated from "./map/MapPaginated";
import MapSingle from "./map/MapSingle";

import MarketSingle from "./market/MarketSingle";
import MarketPaginated from "./market/MarketPaginated";
import ParSingle from "./market/ParSingle";
import ParPaginated from "./market/ParPaginated";
import RevenueSingle from "./market/RevenueSingle";
import RevenuePaginated from "./market/RevenuePaginated";

import TileSheet from "./TileSheet";
import TileManifest from "./TileManifest";

import B18Map from "./b18/Map";
import B18Tiles from "./b18/Tiles";
import B18Tokens from "./b18/Tokens";

const Game = () => {
  let params = useParams();
  let game = games[params.game];

  if (!game) {
    return <Redirect to="/" />;
  }

  return (
    <GameContext.Provider value={params.game}>
      {game.wip && (
        <div className="WIP">
          <div>
            <p>This game is a work in progress. It is not fully implemented</p>
          </div>
        </div>
      )}
      <Switch>
        <Route path="/:game/background">
          <Background />
        </Route>
        <Route path="/:game/bankpool">
          <BankPool />
        </Route>
        <Route path="/:game/cards">
          <Cards />
        </Route>
        <Route path="/:game/charters">
          <Charters />
        </Route>
        <Route path="/:game/ipo">
          <IPO />
        </Route>
        <Route path="/:game/map" exact>
          <MapSingle />
        </Route>
        <Route path="/:game/map-paginated" exact>
          <MapPaginated />
        </Route>
        <Route path="/:game/map/:variation">
          <MapSingle />
        </Route>
        <Route path="/:game/map-paginated/:variation">
          <MapPaginated />
        </Route>
        <Route path="/:game/market" exact>
         <MarketSingle />
        </Route>
        <Route path="/:game/market-paginated">
          <MarketPaginated />
        </Route>
        <Route path="/:game/revenue">
          <RevenueSingle />
        </Route>
        <Route path="/:game/revenue-paginated">
          <RevenuePaginated />
        </Route>
        <Route path="/:game/par">
          <ParSingle />
        </Route>
        <Route path="/:game/par-paginated">
          <ParPaginated />
        </Route>
        <Route path="/:game/tile-manifest">
          <TileManifest />
        </Route>
        <Route path="/:game/tiles">
          <TileSheet />
        </Route>
        <Route path="/:game/tokens">
          <Tokens />
        </Route>
        <Route path="/:game/b18-map">
          <B18Map />
        </Route>
        <Route path="/:game/b18-tiles-:color">
          <B18Tiles />
        </Route>
        <Route path="/:game/b18-tokens">
          <B18Tokens />
        </Route>
        <Route>
          <About />
        </Route>
      </Switch>
    </GameContext.Provider>
  );
};

export default Game;
