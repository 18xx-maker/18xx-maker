import { Navigate } from "react-router";

import Root from "@/components/Root";
import RouteError from "@/components/RouteError";
import App from "@/components/pages/App";
import DocsPage from "@/components/pages/DocsPage";
import ElementsPage from "@/components/pages/ElementsPage";
import HomePage from "@/components/pages/HomePage";
import SettingsPage from "@/components/pages/SettingsPage";
import AllTilesPage from "@/components/pages/elements/AllTilesPage";
import AtomsPage from "@/components/pages/elements/AtomsPage";
import LogosPage from "@/components/pages/elements/LogosPage";
import PositioningPage from "@/components/pages/elements/PositioningPage";
import BackgroundPage from "@/components/pages/games/BackgroundPage";
import CardPage from "@/components/pages/games/CardPage";
import CardsPage from "@/components/pages/games/CardsPage";
import CharterPage from "@/components/pages/games/CharterPage";
import ChartersPage from "@/components/pages/games/ChartersPage";
import GamePage from "@/components/pages/games/GamePage";
import InfoPage from "@/components/pages/games/InfoPage";
import MapPage from "@/components/pages/games/MapPage";
import MarketPage from "@/components/pages/games/MarketPage";
import ParPage from "@/components/pages/games/ParPage";
import ProblemsPage from "@/components/pages/games/ProblemsPage";
import RevenuePage from "@/components/pages/games/RevenuePage";
import TileManifestPage from "@/components/pages/games/TileManifestPage";
import TilePage from "@/components/pages/games/TilePage";
import TilesPage from "@/components/pages/games/TilesPage";
import TokenPage from "@/components/pages/games/TokenPage";
import TokensPage from "@/components/pages/games/TokensPage";
import B18MapPage from "@/components/pages/games/b18/B18MapPage";
import B18TilesPage from "@/components/pages/games/b18/B18TilesPage";
import B18TokensPage from "@/components/pages/games/b18/B18TokensPage";
// Games Routes
import LoadGamesPage from "@/components/pages/load/LoadGamesPage";

import capability from "@/util/capability";

export const rootRoutes = [
  {
    path: "*",
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "app",
        element: capability.electron ? <App /> : <Navigate to="/" />,
      },
      {
        path: "elements/*",
        element: <ElementsPage />,
        children: [
          { index: true, element: <AtomsPage /> },
          { path: "tiles", element: <AllTilesPage /> },
          { path: "logos", element: <LogosPage /> },
          { path: "positioning", element: <PositioningPage /> },
        ],
      },
      {
        path: "games/*",
        children: [
          { index: true, element: <LoadGamesPage /> },
          {
            path: ":slug/*",
            element: <GamePage />,
            children: [
              { index: true, element: <InfoPage /> },
              { path: "b18/map", element: <B18MapPage /> },
              { path: "b18/tiles/:color", element: <B18TilesPage /> },
              { path: "b18/tokens", element: <B18TokensPage /> },
              { path: "background", element: <BackgroundPage /> },
              { path: "cards", element: <CardsPage /> },
              { path: "cards/:type/:index", element: <CardPage /> },
              { path: "charters", element: <ChartersPage /> },
              { path: "charters/:index", element: <CharterPage /> },
              { path: "map", element: <MapPage /> },
              { path: "market", element: <MarketPage /> },
              { path: "par", element: <ParPage /> },
              { path: "problems", element: <ProblemsPage /> },
              { path: "revenue", element: <RevenuePage /> },
              { path: "tile-manifest", element: <TileManifestPage /> },
              { path: "tiles", element: <TilesPage /> },
              { path: "tiles/:id", element: <TilePage /> },
              { path: "tokens", element: <TokensPage /> },
              { path: "tokens/:index", element: <TokenPage /> },
            ],
          },
        ],
      },
      { path: "docs/*", element: <DocsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
];
