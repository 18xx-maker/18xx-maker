import { useState, useSyncExternalStore } from "react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

// A memory router for tests, built on wouter's memoryLocation. It keeps the
// history stack itself so a test can go back and forward, and exposes the
// state the tests read: router.state.location.{pathname,search,hash} (search
// and hash with their "?" and "#") and router.state.historyAction (PUSH,
// REPLACE or POP, as the last navigation made it).

const split = (url) => {
  let rest = url;
  let hash = "";
  const h = rest.indexOf("#");
  if (h >= 0) {
    hash = rest.slice(h);
    rest = rest.slice(0, h);
  }
  let search = "";
  const q = rest.indexOf("?");
  if (q >= 0) {
    search = rest.slice(q);
    rest = rest.slice(0, q);
  }
  return {
    pathname: rest || "/",
    search: search === "?" ? "" : search,
    hash: hash === "#" ? "" : hash,
  };
};

// "/x?a=1" or { pathname, search, hash } (what is missing is the current
// pathname, an empty search and an empty hash, as in a link) to a url
const toUrl = (to, current) => {
  if (typeof to === "string") return to;
  const search = to.search ? to.search.replace(/^\??/, "?") : "";
  const hash = to.hash ? to.hash.replace(/^#?/, "#") : "";
  return `${to.pathname ?? current.pathname}${search}${hash}`;
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

  const navigate = (to, { replace = false } = {}) => {
    if (typeof to === "number") {
      const next = at + to;
      if (next < 0 || next >= stack.length) return;
      at = next;
      action = "POP";
    } else {
      const url = toUrl(to, current());
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
  };

  const subscribeHash = (listener) => {
    hashListeners.add(listener);
    return () => hashListeners.delete(listener);
  };

  const useLocation = () => {
    const [pathname] = memory.hook();
    return [pathname, navigate];
  };
  useLocation.searchHook = memory.searchHook;
  const useHash = () =>
    useSyncExternalStore(subscribeHash, () => current().hash);
  useLocation.useHash = useHash;
  // The router module goes back and forward through this
  useLocation.go = navigate;

  return {
    hook: useLocation,
    navigate,
    get state() {
      return { location: current(), historyAction: action };
    },
  };
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
