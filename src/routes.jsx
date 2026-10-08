import Root from "@/components/Root";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
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
import ChangesPage from "@/components/pages/games/ChangesPage";
import CharterPage from "@/components/pages/games/CharterPage";
import ChartersPage from "@/components/pages/games/ChartersPage";
import GamePage from "@/components/pages/games/GamePage";
import HistoryPage from "@/components/pages/games/HistoryPage";
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

import { Redirect, Route, Switch } from "@/router";
import capability from "@/util/capability";

// Every page by its path pattern, in the order they are matched. The
// patterns are the single source of truth: the routes below are made from
// them, and the tests list them. A :slug is a game; the layouts (the elements
// and game pages) wrap the pages of their group.
const topPages = {
  "/": <HomePage />,
  "/app": capability.electron ? <App /> : <Redirect to="/" />,
  "/settings": <SettingsPage />,
};

const elementsPages = {
  "/elements": <AtomsPage />,
  "/elements/tiles": <AllTilesPage />,
  "/elements/logos": <LogosPage />,
  "/elements/positioning": <PositioningPage />,
};

const gamePages = {
  "/games/:slug": <InfoPage />,
  "/games/:slug/b18/map": <B18MapPage />,
  "/games/:slug/b18/tiles/:color": <B18TilesPage />,
  "/games/:slug/b18/tokens": <B18TokensPage />,
  "/games/:slug/background": <BackgroundPage />,
  "/games/:slug/cards": <CardsPage />,
  "/games/:slug/cards/:type/:index": <CardPage />,
  "/games/:slug/changes": <ChangesPage />,
  "/games/:slug/charters": <ChartersPage />,
  "/games/:slug/charters/:index": <CharterPage />,
  "/games/:slug/history": <HistoryPage />,
  "/games/:slug/map": <MapPage />,
  "/games/:slug/market": <MarketPage />,
  "/games/:slug/par": <ParPage />,
  "/games/:slug/problems": <ProblemsPage />,
  "/games/:slug/revenue": <RevenuePage />,
  "/games/:slug/tile-manifest": <TileManifestPage />,
  "/games/:slug/tiles": <TilesPage />,
  "/games/:slug/tiles/:id": <TilePage />,
  "/games/:slug/tokens": <TokensPage />,
  "/games/:slug/tokens/:index": <TokenPage />,
};

// Every top-level route, in the order they are matched: AppRoutes renders
// this table and routePatterns is made from it. A route with a layout wraps
// its pages (an unknown path in a group is the layout with no page, and an
// unknown path outside of them is Root with no page). The docs are one page
// for every path under /docs.
const topRoutes = [
  ...Object.entries(topPages).map(([path, element]) => ({ path, element })),
  {
    path: "/elements/*?",
    layout: ElementsPage,
    pages: elementsPages,
  },
  { path: "/games", element: <LoadGamesPage /> },
  { path: "/games/:slug/*?", layout: GamePage, pages: gamePages },
  { path: "/docs/*?", element: <DocsPage /> },
];

// Every page as a path pattern, in the order the pages are listed in
export const routePatterns = topRoutes.flatMap(({ path, pages }) =>
  pages ? Object.keys(pages) : [path],
);

const pages = (list) => (
  <Switch>
    {Object.entries(list).map(([path, element]) => (
      <Route key={path} path={path}>
        {element}
      </Route>
    ))}
  </Switch>
);

const AppRoutes = () => (
  <RouteErrorBoundary>
    <Root>
      <Switch>
        {topRoutes.map(({ path, element, layout: Layout, pages: list }) => (
          <Route key={path} path={path}>
            {Layout ? <Layout>{pages(list)}</Layout> : element}
          </Route>
        ))}
      </Switch>
    </Root>
  </RouteErrorBoundary>
);

export default AppRoutes;
