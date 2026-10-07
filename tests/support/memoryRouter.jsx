import { useState, useSyncExternalStore } from "react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { parsePath, resolveTo } from "@/router/url";

// A memory router for tests, built on wouter's memoryLocation. It keeps the
// history stack itself so a test can go back and forward, and exposes the
// state the tests read: router.state.location.{pathname,search,hash} (search
// and hash with their "?" and "#") and router.state.historyAction (PUSH,
// REPLACE or POP, as the last navigation made it).

// The parts of a url, with "/" for no pathname
const split = (url) => {
  const parts = parsePath(url);
  return { ...parts, pathname: parts.pathname || "/" };
};

export const createMemoryRouter = (
  entries = ["/"],
  index = entries.length - 1,
) => {
  const stack = [...entries];
  let at = index;
  let action = "POP";
  const hashListeners = new Set();
  const current = () => split(stack[at]);

  const memory = memoryLocation({
    path: current().pathname + current().search,
  });

  const sync = () => {
    const { pathname, search } = current();
    memory.navigate(pathname + search, { replace: true });
    hashListeners.forEach((listener) => listener());
  };

  // Resolves once the location is set, so a test can await it (in act)
  const navigate = (to, { replace = false } = {}) => {
    if (typeof to === "number") {
      const next = at + to;
      if (next < 0 || next >= stack.length) return Promise.resolve();
      at = next;
      action = "POP";
    } else {
      const url = resolveTo(to, current());
      if (replace) {
        stack[at] = url;
        action = "REPLACE";
      } else {
        stack.splice(at + 1, stack.length, url);
        at += 1;
        action = "PUSH";
      }
    }
    sync();
    return Promise.resolve();
  };

  const subscribeHash = (listener) => {
    hashListeners.add(listener);
    return () => hashListeners.delete(listener);
  };

  // The app navigates through the router object, so a test can spy on it
  const appNavigate = (to, options) => router.navigate(to, options);

  const useLocation = () => {
    const [pathname] = memory.hook();
    return [pathname, appNavigate];
  };
  useLocation.searchHook = memory.searchHook;
  const useHash = () =>
    useSyncExternalStore(subscribeHash, () => current().hash);
  useLocation.useHash = useHash;
  // The router module goes back and forward through this
  useLocation.go = appNavigate;

  const router = {
    hook: useLocation,
    navigate,
    get state() {
      return { location: current(), historyAction: action };
    },
  };
  return router;
};

// Provides a router made with createMemoryRouter
export const RouterProvider = ({ router, children }) => (
  <Router hook={router.hook}>{children}</Router>
);

// A router of its own at initialEntries, for tests that do not read it
export const MemoryRouter = ({ initialEntries = ["/"], children }) => {
  const [router] = useState(() => createMemoryRouter(initialEntries));
  return <RouterProvider router={router}>{children}</RouterProvider>;
};
