import { useMatch } from "react-router";

import { useGame } from "@/hooks/game";

export const useEditor = () => {
  const game = useGame();
  const gameMatch = useMatch("/games/:slug/:section");

  if (!game || !gameMatch) {
    return false;
  }

  return gameMatch.params.section !== "";
};

export default useEditor;
