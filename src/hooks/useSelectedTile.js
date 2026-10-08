import { useCallback } from "react";

import { useStringParam } from "@/util/query";

// The tile selected on the Tiles tab of the edit panel (?tile=26%7CT2: an id
// may have a variant after a "|", so it is encoded). Selecting is no page of
// history. It is only a query parameter, the tab checks the tile exists.
export const useSelectedTile = () => {
  const [tile, setTile] = useStringParam("tile", "");
  const select = useCallback((id) => setTile(id, { replace: true }), [setTile]);
  const clear = useCallback(() => setTile("", { replace: true }), [setTile]);

  return { tile, select, clear };
};

export default useSelectedTile;
