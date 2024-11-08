import { createRoot } from "react-dom/client";

import "./fonts.css";
import "./index.css";

import "./i18n";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

import Root from "./Root";
import { isElectron } from "./util";

// Root Routes
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Elements from "./pages/Elements";

// Elements Routes
import Atoms from "./pages/elements/Atoms";
import Logos from "./pages/elements/Logos";
import Tiles from "./pages/elements/Tiles";

// Games Routes
import LoadGames from "./games/LoadGames";
import Game from "./pages/games/Game";

// Game Routes
import Background from "./pages/games/Background";
import Card from "./pages/games/Card";
import Cards from "./pages/games/Cards";
import Charter from "./pages/games/Charter";
import Charters from "./pages/games/Charters";
import Info from "./pages/games/Info";
import Map from "./pages/games/Map";
import Market from "./pages/games/Market";
import Par from "./pages/games/Par";
import Revenue from "./pages/games/Revenue";
import TileManifest from "./pages/games/TileManifest";
import Tile from "./pages/games/Tile";
import GameTiles from "./pages/games/Tiles";
import Token from "./pages/games/Token";
import Tokens from "./pages/games/Tokens";

import B18Map from "./pages/games/b18/Map";
import B18Tiles from "./pages/games/b18/Tiles";
import B18Tokens from "./pages/games/b18/Tokens";

// Test to see if we're running in electron or not. If so use a hash router
// since it's based on files
const createRouter = isElectron ? createHashRouter : createBrowserRouter;
const router = createRouter(
  [
    {
      path: "*",
      element: <Root />,
      children: [
        { index: true, element: <Home /> },
        {
          path: "elements/*",
          element: <Elements />,
          children: [
            { index: true, element: <Atoms /> },
            { path: "tiles", element: <Tiles /> },
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
                { path: "tiles", element: <GameTiles /> },
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
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionStatusRevalidation: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);

const App = () => (
  <RouterProvider
    router={router}
    future={{
      v7_startTransition: true,
    }}
  />
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
