import { parse } from "regexparam";
import { matchRoute } from "wouter";

import { routePatterns } from "@/routes";

// The route pattern of the page a URL shows, e.g. "/games/:slug/tiles/:id"
export const matchedPattern = (url) => {
  const path = url.split("?")[0].split("#")[0];
  return (
    routePatterns.find((pattern) => matchRoute(parse, pattern, path)[0]) ?? "/"
  );
};
