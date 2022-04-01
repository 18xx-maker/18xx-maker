import React from "react";
import { Route, Routes, useMatch } from "react-router-dom";

import LoadGames from "../games/LoadGames";

import { useGame } from "../context/GameContext";

import Game from "./games/Game";

const Games = () => {
  const { game } = useGame();

  return (
    <Routes>
      <Route path="/" element={<LoadGames/>}/>
      <Route path="*" element={<Game game={game}/>}/>
    </Routes>
  );
};

export default Games;
