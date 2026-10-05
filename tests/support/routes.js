import { matchRoutes } from "react-router";

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

// The full path pattern of the leaf route a URL matches, e.g.
// "/games/:slug/tiles/:id"
export const matchedPattern = (url, routes = rootRoutes) => {
  const matches = matchRoutes(routes, url.split("?")[0]);
  return (
    matches.reduce((parent, { route }) => {
      const path = route.index
        ? parent
        : `${parent}/${route.path}`.replace(/\/\*$/, "").replace(/\/+/g, "/");
      return path;
    }, "") || "/"
  );
};
