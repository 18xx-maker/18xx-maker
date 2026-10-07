// Pure helpers for the url strings the router passes around: a string is
// "/path?search#hash", an object is { pathname, search, hash } (what is missing
// is the current pathname, an empty search and an empty hash, as in a link).

// "/a?b=1#c" to { pathname: "/a", search: "?b=1", hash: "#c" }
export const parsePath = (url = "") => {
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
    pathname: rest,
    search: search === "?" ? "" : search,
    hash: hash === "#" ? "" : hash,
  };
};

// The "?" of a search and the "#" of a hash are optional in a location part
export const withSearch = (search = "") =>
  search ? search.replace(/^\??/, "?") : "";
export const withHash = (hash = "") => (hash ? hash.replace(/^#?/, "#") : "");

export const formatPath = ({ pathname = "", search = "", hash = "" }) =>
  `${pathname}${withSearch(search)}${withHash(hash)}`;

// A target (string or object) to a url string. A string without a pathname
// ("?a=1", "#top") stays on the current page.
export const resolveTo = (to, current) => {
  const parts = typeof to === "string" ? parsePath(to) : to;
  return formatPath({
    ...parts,
    pathname: parts.pathname || current.pathname,
  });
};

// A route pattern for wouter: it needs a splat as optional to match the path
// without a trailing segment ("/games/*" is "/games" and "/games/x")
export const optionalSplat = (pattern) => pattern.replace(/\/\*$/, "/*?");

export const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};
