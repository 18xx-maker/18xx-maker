import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";

import { clearHexSearch, selectHexSearch } from "@/util/query";

// The hex selected on the map (?hex=C11, the first coordinate of its group).
// Selecting is no page of history.
export const useSelectedHex = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const hex = new URLSearchParams(search).get("hex") || "";

  const select = useCallback(
    (coord) =>
      navigate({ search: selectHexSearch(search, coord) }, { replace: true }),
    [navigate, search],
  );
  const clear = useCallback(
    () => navigate({ search: clearHexSearch(search) }, { replace: true }),
    [navigate, search],
  );

  return { hex, select, clear };
};

export default useSelectedHex;
