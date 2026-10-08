import { useCallback } from "react";

import { useLocation, useNavigate } from "@/router";
import { selectTileSearch, useStringParam } from "@/util/query";

// The tile selected on the Tiles tab of the edit panel (?tile=26%7CT2: an id
// may have a variant after a "|", so it is encoded). Selecting is no page of
// history. It is only a query parameter, the tab checks the tile exists.
export const useSelectedTile = () => {
  const [tile, setTile] = useStringParam("tile", "");
  const navigate = useNavigate();
  const { search } = useLocation();
  // Also opens the Tiles tab, which is where a tap on the sheet picks a tile
  const select = useCallback(
    (id) =>
      id
        ? navigate({ search: selectTileSearch(search, id) }, { replace: true })
        : setTile("", { replace: true }),
    [navigate, search, setTile],
  );
  const clear = useCallback(() => setTile("", { replace: true }), [setTile]);

  return { tile, select, clear };
};

export default useSelectedTile;
