import { useCallback, useSyncExternalStore } from "react";

const supported = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function";

// Subscribes to a media query (use up/down from "@/ui" to build one). The
// server and non-matchMedia environments report defaultMatches, so the first
// render never touches window.
const useMediaQuery = (query, defaultMatches = false) => {
  const subscribe = useCallback(
    (notify) => {
      if (!supported()) {
        return () => {};
      }
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    [query],
  );

  const getSnapshot = () =>
    supported() ? window.matchMedia(query).matches : defaultMatches;

  return useSyncExternalStore(subscribe, getSnapshot, () => defaultMatches);
};

export default useMediaQuery;
