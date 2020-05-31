import React from "react";

const GameContext = React.createContext({ game: null });

export const useGame = () => {
  const [game, setGame] = React.useState(() => {
    try {
      let game = localStorage.getItem('game');
      return game ? JSON.parse(game) : null;
    } catch (error) {
      console.error(error);
      localStorage.removeItem('game');
      return null;
    }
  });

  return {
    game,
    loadGame: (game) => {
      if (game) {
        localStorage.setItem('game', JSON.stringify(game));
      } else {
        localStorage.removeItem('game');
      }

      setGame(game);
    },
    closeGame: () => {
      localStorage.removeItem('game');
      setGame(null);
    }
  };
}

export default GameContext;
