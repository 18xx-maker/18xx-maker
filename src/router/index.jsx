// The only module that imports wouter. The app asks for a location the way
// react-router had it: { pathname, search, hash } with the "?" and "#", a
// navigate that takes a url, an object or a number of entries, and params
// that are decoded. A url is "/path?search#hash" in both modes: with the
// browser router that is the address, in hash mode (Electron, the page is a
// file) it is everything after the first "#" of the address.
import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import {
  Redirect,
  Route,
  Switch,
  Link as WouterLink,
  Router as WouterRouter,
  matchRoute,
  useRouter,
  useParams as useWouterParams,
} from "wouter";
import { useLocationProperty } from "wouter/use-browser-location";

import { useHashLocation } from "@/router/hash";
import {
  optionalSplat,
  resolveTo,
  safeDecode,
  withHash,
  withSearch,
} from "@/router/url";

export { Redirect, Route, Switch, optionalSplat };

const browserHash = () => location.hash;
const useBrowserHash = () => useLocationProperty(browserHash);

// hash: the location is in the hash of the address (Electron)
export const Router = ({ hash = false, children }) => (
  <WouterRouter hook={hash ? useHashLocation : undefined}>
    {children}
  </WouterRouter>
);

// The anchor of the location, "#heading" or ""
export const useHash = () => {
  const { hook } = useRouter();
  return withHash((hook.useHash ?? useBrowserHash)());
};

// The search of the location, "?a=1" or "". The search hook is read as it is:
// wouter's useSearch decodes it, and a value is encoded twice on purpose.
export const useSearch = () => {
  const router = useRouter();
  return withSearch(router.searchHook(router));
};

// { pathname, search, hash }. The pathname is as it is in the address.
export const useLocation = () => {
  const router = useRouter();
  const [raw] = router.hook(router);
  const pathname = raw || "/";
  const search = useSearch();
  const hash = useHash();
  return useMemo(() => ({ pathname, search, hash }), [pathname, search, hash]);
};

// navigate(to, { replace }): to is a url, { pathname, search, hash } (what is
// missing is the current pathname) or a number of entries in the history.
// The function stays the same between locations.
export const useNavigate = () => {
  const router = useRouter();
  const location = useLocation();
  const current = useRef(location);
  useLayoutEffect(() => {
    current.current = location;
  });
  const [, navigate] = router.hook(router);

  return useCallback(
    (to, options) => {
      if (typeof to === "number") {
        (router.hook.go ?? ((n) => history.go(n)))(to);
      } else {
        navigate(resolveTo(to, current.current), options);
      }
    },
    [router, navigate],
  );
};

// Decoded params. A splat that matched nothing is an empty string, as in
// react-router (the "*" of "/games/x" in "/games/:slug/*").
const decodeParams = (params, pattern = "") =>
  Object.fromEntries(
    Object.entries({
      ...params,
      ...(pattern.endsWith("/*?") ? { "*": params["*"] ?? "" } : {}),
    }).map(([key, value]) => [
      key,
      value === undefined ? value : safeDecode(value),
    ]),
  );

// The match of a pattern with the location (null for none) as
// { params, pathname }, like react-router had it. A trailing /* matches the
// path without a rest too.
export const useMatch = (pattern) => {
  const router = useRouter();
  const [raw] = router.hook(router);
  const pathname = raw || "/";

  return useMemo(() => {
    const optional = optionalSplat(pattern);
    const [matches, params] = matchRoute(router.parser, optional, pathname);
    if (!matches) return null;
    return { params: decodeParams(params, optional), pathname };
  }, [router.parser, pattern, pathname]);
};

// The params of the route, decoded
export const useParams = () => {
  const params = useWouterParams();
  return useMemo(() => decodeParams(params), [params]);
};

// to is a url or { pathname, search, hash }
export const Link = forwardRef(({ to, href, ...props }, ref) => {
  const location = useLocation();
  return (
    <WouterLink ref={ref} href={resolveTo(to ?? href, location)} {...props} />
  );
});
Link.displayName = "Link";
