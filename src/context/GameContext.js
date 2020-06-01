import { createContext } from "react";

import useLocalState from "../util/useLocalState";

const GameContext = createContext({ game: null });

export const useGame = () => {
  const [game, setGame] = useLocalState('game', null);

  let rotation = 0;
  if (game && game.info.orientation !== "horizontal") {
    rotation = 90;
  }

  return {
    game,
    rotation,
    loadGame: setGame,
    closeGame: () => setGame(null)
  };
}

export default GameContext;
