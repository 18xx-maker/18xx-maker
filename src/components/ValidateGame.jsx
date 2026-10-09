import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { validateLoadedGame } from "@/state";
import { selectAssets } from "@/state/selectors";

// Checks the loaded game against the schema once it settles, so typing in the
// editor does not check on every change. Only this component follows the game,
// the page around it does not render on an edit.
const ValidateGame = () => {
  const dispatch = useDispatch();
  const game = useSelector((state) => state.game);
  // The images are part of what is checked
  const assets = useSelector(selectAssets);

  useEffect(() => {
    if (!game) return;
    const timeout = setTimeout(() => dispatch(validateLoadedGame(game)), 500);
    return () => clearTimeout(timeout);
  }, [dispatch, game, assets]);

  return null;
};

export default ValidateGame;
