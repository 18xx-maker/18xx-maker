import { Route, Routes, useMatch, useNavigate } from "react-router";

import Background from "./Background";
import Card from "./Card";
import Cards from "./Cards";
import Charter from "./Charter";
import Charters from "./Charters";
import Info from "./Info";
import Map from "./Map";
import Market from "./Market";
import Par from "./Par";
import Revenue from "./Revenue";
import TileManifest from "./TileManifest";
import Tile from "./Tile";
import Tiles from "./Tiles";
import Token from "./Token";
import Tokens from "./Tokens";

import B18Map from "./b18/Map";
import B18Tiles from "./b18/Tiles";
import B18Tokens from "./b18/Tokens";

const Game = ({ game }) => {
  const navigate = useNavigate();
  const match = useMatch("/games/:slug/*");

  if (!game) {
    return null;
  }

  if (match && game.meta.slug !== match.params.slug) {
    navigate(match.url);
  }

  return (
    <Routes>
      <Route path="" element={<Info game={game} />} />
      <Route path="/b18/map" element={<B18Map />} />
      <Route path="/b18/tiles/:color" element={<B18Tiles />} />
      <Route path="/b18/tokens" element={<B18Tokens />} />
      <Route path="/background" element={<Background />} />
      <Route path="/cards" element={<Cards />} />
      <Route path="/cards/:type/:index" element={<Card />} />
      <Route path="/charters" element={<Charters />} />
      <Route path="/charters/:index" element={<Charter />} />
      <Route path="/map" element={<Map />} />
      <Route path="/market" element={<Market />} />
      <Route path="/par" element={<Par />} />
      <Route path="/revenue" element={<Revenue />} />
      <Route path="/tile-manifest" element={<TileManifest />} />
      <Route path="/tiles" element={<Tiles />} />
      <Route path="/tiles/:id" element={<Tile />} />
      <Route path="/tokens" element={<Tokens />} />
      <Route path="/tokens/:index" element={<Token />} />
    </Routes>
  );
};

export default Game;
