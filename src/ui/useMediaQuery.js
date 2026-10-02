import { useCallback, useSyncExternalStore } from "react";

const supported = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function";

// Subscribes to a media query (build one with up from "@/ui"). The
// server and non-matchMedia environments report defaultMatches, so the first
// render never touches window.
const useMediaQuery = (rawQuery, defaultMatches = false) => {
  // Like MUI, accept "@media (min-width:600px)" as well as the bare query
  const query = rawQuery.replace(/^@media( ?)/m, "");
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
