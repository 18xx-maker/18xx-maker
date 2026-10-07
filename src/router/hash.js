import { useLocationProperty } from "wouter/use-browser-location";

import { parsePath } from "@/router/url";

// The location in the hash, for the app where the page is a file (Electron).
// The hash holds the whole url: "#/games/1889/map?print=true", and an anchor
// is a second #: "#/docs/games/tiles#heading".

const inHash = () => parsePath(location.hash.slice(1));

const pathname = () => {
  const path = inHash().pathname;
  return path.startsWith("/") ? path : `/${path}`;
};

export const navigate = (to, { replace = false } = {}) => {
  // The url is relative to the page: only its hash changes. The history
  // methods tell the hooks (see wouter/use-browser-location).
  history[replace ? "replaceState" : "pushState"](null, "", `#${to}`);
};

export const useHashPathname = () => useLocationProperty(pathname);
export const useHashSearch = () => useLocationProperty(() => inHash().search);
export const useHashAnchor = () => useLocationProperty(() => inHash().hash);

// The location hook for the Router. Statics are what the Router and the
// router module read: how to build an href, the search and the anchor.
export const useHashLocation = () => [useHashPathname(), navigate];
useHashLocation.hrefs = (href) => `#${href}`;
useHashLocation.searchHook = useHashSearch;
useHashLocation.useHash = useHashAnchor;
