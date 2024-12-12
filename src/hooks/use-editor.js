import { useMatch } from "react-router";

import { useGame } from "@/hooks/game";

export const useEditor = () => {
  const game = useGame();
  const gameMatch = useMatch("/games/:slug/*");

  if (!game || !gameMatch) {
    return false;
  }

  return gameMatch.params["*"] !== "";
};

export default useEditor;
