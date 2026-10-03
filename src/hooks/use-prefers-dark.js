import { useSyncExternalStore } from "react";

const QUERY = "(prefers-color-scheme: dark)";

const subscribe = (callback) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;

// Whether the system prefers a dark color scheme
export const usePrefersDark = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => false);
