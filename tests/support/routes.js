import { parse } from "regexparam";
import { matchRoute } from "wouter";

import { routePatterns as patterns } from "@/routes";

// Every page in the router as a full path pattern, e.g.
// "/games/:slug/tiles/:id" (the pattern list of the routes)
export const routePatterns = () => [...patterns];

// The docs are one page for every path under /docs
const matchable = (pattern) => (pattern === "/docs" ? "/docs/*?" : pattern);

// The full path pattern of the page a URL shows, e.g.
// "/games/:slug/tiles/:id"
export const matchedPattern = (url) => {
  const path = url.split("?")[0].split("#")[0];
  return (
    patterns.find(
      (pattern) => matchRoute(parse, matchable(pattern), path)[0],
    ) ?? "/"
  );
};
