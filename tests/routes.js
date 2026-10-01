import { rootRoutes } from "@/routes";

// Every leaf route in rootRoutes as a full path pattern, e.g.
// "/games/:slug/tiles/:id". Layout routes (those with children) are not
// leaves; their index route stands for them.
export const routePatterns = (routes = rootRoutes, parent = "") =>
  routes.flatMap((route) => {
    const path = route.index
      ? parent
      : `${parent}/${route.path}`.replace(/\/\*$/, "").replace(/\/+/g, "/");
    return route.children ? routePatterns(route.children, path) : [path || "/"];
  });

// Every route pattern that has a smoke test, and the file that has it. When
// a route is added to src/routes.jsx, add a test for it and list it here.
export const coveredRoutes = {
  "/": "routes.test.jsx",
  "/app": "routes.app.test.jsx",
  "/docs": "routes.test.jsx",
  "/elements": "routes.test.jsx",
  "/elements/tiles": "routes.test.jsx",
  "/elements/logos": "routes.test.jsx",
  "/games": "routes.test.jsx",
  "/games/:slug": "game.parts.test.jsx",
  "/games/:slug/b18/map": "game.b18.test.jsx",
  "/games/:slug/b18/tiles/:color": "game.b18.test.jsx",
  "/games/:slug/b18/tokens": "game.b18.test.jsx",
  "/games/:slug/background": "game.parts.test.jsx",
  "/games/:slug/cards": "game.parts.test.jsx",
  "/games/:slug/cards/:type/:index": "game.single.test.jsx",
  "/games/:slug/charters": "game.parts.test.jsx",
  "/games/:slug/charters/:index": "game.single.test.jsx",
  "/games/:slug/map": "game.parts.test.jsx",
  "/games/:slug/market": "game.parts.test.jsx",
  "/games/:slug/par": "game.parts.test.jsx",
  "/games/:slug/revenue": "game.parts.test.jsx",
  "/games/:slug/tile-manifest": "game.parts.test.jsx",
  "/games/:slug/tiles": "game.parts.test.jsx",
  "/games/:slug/tiles/:id": "game.single.test.jsx",
  "/games/:slug/tokens": "game.parts.test.jsx",
  "/games/:slug/tokens/:index": "game.single.test.jsx",
};
