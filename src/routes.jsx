import { Navigate } from "react-router";

import Root from "@/components/Root";
import DocsNav from "@/components/nav/DocsNav";
import ElementsNav from "@/components/nav/ElementsNav";
import GameNav from "@/components/nav/GameNav";
import App from "@/components/pages/App";
import Docs from "@/components/pages/Docs";
import Elements from "@/components/pages/Elements";
import Home from "@/components/pages/Home";
import Atoms from "@/components/pages/elements/Atoms";
import Logos from "@/components/pages/elements/Logos";
import AllTiles from "@/components/pages/elements/Tiles";
import Background from "@/components/pages/games/Background";
import Card from "@/components/pages/games/Card";
import Cards from "@/components/pages/games/Cards";
import Charter from "@/components/pages/games/Charter";
import Charters from "@/components/pages/games/Charters";
import Game from "@/components/pages/games/Game";
import Info from "@/components/pages/games/Info";
import Map from "@/components/pages/games/Map";
import Market from "@/components/pages/games/Market";
import Par from "@/components/pages/games/Par";
import Revenue from "@/components/pages/games/Revenue";
import Tile from "@/components/pages/games/Tile";
import TileManifest from "@/components/pages/games/TileManifest";
import Tiles from "@/components/pages/games/Tiles";
import Token from "@/components/pages/games/Token";
import Tokens from "@/components/pages/games/Tokens";
import B18Map from "@/components/pages/games/b18/Map";
import B18Tiles from "@/components/pages/games/b18/Tiles";
import B18Tokens from "@/components/pages/games/b18/Tokens";
// Games Routes
import LoadGames from "@/components/pages/load/LoadGames";
import capability from "@/util/capability";

export const rootRoutes = [
  {
    path: "*",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "app",
        element: capability.electron ? <App /> : <Navigate to="/" />,
      },
      {
        path: "elements/*",
        element: <Elements />,
        children: [
          { index: true, element: <Atoms /> },
          { path: "tiles", element: <AllTiles /> },
          { path: "logos", element: <Logos /> },
        ],
      },
      {
        path: "games/*",
        children: [
          { index: true, element: <LoadGames /> },
          {
            path: ":slug/*",
            element: <Game />,
            children: [
              { index: true, element: <Info /> },
              { path: "b18/map", element: <B18Map /> },
              { path: "b18/tiles/:color", element: <B18Tiles /> },
              { path: "b18/tokens", element: <B18Tokens /> },
              { path: "background", element: <Background /> },
              { path: "cards", element: <Cards /> },
              { path: "cards/:type/:index", element: <Card /> },
              { path: "charters", element: <Charters /> },
              { path: "charters/:index", element: <Charter /> },
              { path: "map", element: <Map /> },
              { path: "market", element: <Market /> },
              { path: "par", element: <Par /> },
              { path: "revenue", element: <Revenue /> },
              { path: "tile-manifest", element: <TileManifest /> },
              { path: "tiles", element: <Tiles /> },
              { path: "tiles/:id", element: <Tile /> },
              { path: "tokens", element: <Tokens /> },
              { path: "tokens/:index", element: <Token /> },
            ],
          },
        ],
      },
      { path: "docs/*", element: <Docs /> },
    ],
  },
];

export const sideRoutes = [
  { path: "games/*", element: <GameNav /> },
  { path: "elements/*", element: <ElementsNav /> },
  { path: "docs/*", element: <DocsNav /> },
];
