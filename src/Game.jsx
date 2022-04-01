import React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

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
    return <Navigate to="/" />;
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
      <Routes>
        <Route path="/:game/background" element={<Background />}/>
        <Route path="/:game/bankpool" element={<BankPool />}/>
        <Route path="/:game/cards" element={<Cards />}/>
        <Route path="/:game/charters" element={<Charters />}/>
        <Route path="/:game/ipo" element={<IPO />}/>
        <Route path="/:game/map" element={<MapSingle />}/>
        <Route path="/:game/map-paginated" element={<MapPaginated />}/>
        <Route path="/:game/map/:variation" element={<MapSingle />}/>
        <Route path="/:game/map-paginated/:variation" element={<MapPaginated />}/>
        <Route path="/:game/market" element={<MarketSingle />}/>
        <Route path="/:game/market-paginated" element={<MarketPaginated />}/>
        <Route path="/:game/revenue" element={<RevenueSingle />}/>
        <Route path="/:game/revenue-paginated" element={<RevenuePaginated />}/>
        <Route path="/:game/par" element={<ParSingle />}/>
        <Route path="/:game/par-paginated" element={<ParPaginated />}/>
        <Route path="/:game/tile-manifest" element={<TileManifest />}/>
        <Route path="/:game/tiles" element={<TileSheet/>}/>
        <Route path="/:game/tokens" element={<Tokens />}/>
        <Route path="/:game/b18-map" element={<B18Map />}/>
        <Route path="/:game/b18-tiles-:color" element={<B18Tiles />}/>
        <Route path="/:game/b18-tokens" element={<B18Tokens />}/>
        <Route path="*" element={<About/>}/>
      </Routes>
    </GameContext.Provider>
  );
};

export default Game;
