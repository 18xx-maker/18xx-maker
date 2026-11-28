import { useContext } from "react";
import { useSelector } from "react-redux";

import GameContext from "@/context/GameContext";
import { selectAssets } from "@/state/selectors";

// The custom images of the game on screen (see util/assets): undefined when
// the game has none. A GameContext game (the play board) is not the game of
// the store, so it gets none of the store's images.
export const useAssets = () => {
  const override = useContext(GameContext);
  const assets = useSelector(selectAssets);
  return override ? undefined : assets;
};
