import { dissoc } from "ramda";

// Sign-in tokens of the play servers, one per server url, in localStorage
// (never in Redux). Storage can be missing or blocked: every access is
// guarded, a failure reads as no token and never throws.
const KEY = "play-tokens";

const read = () => {
  try {
    const tokens = JSON.parse(window.localStorage.getItem(KEY));
    return tokens && typeof tokens === "object" && !Array.isArray(tokens)
      ? tokens
      : {};
  } catch {
    return {};
  }
};

const write = (tokens) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(tokens));
  } catch {
    // Not stored: the person signs in again next time
  }
};

export const getToken = (url) => {
  const token = read()[url];
  return typeof token === "string" ? token : null;
};

export const setToken = (url, token) => write({ ...read(), [url]: token });

export const clearToken = (url) => {
  write(dissoc(url, read()));
};
