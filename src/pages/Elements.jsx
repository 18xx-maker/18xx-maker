import React from "react";
import { Route, Routes } from "react-router-dom";

import Atoms from "./elements/Atoms";
import Logos from "./elements/Logos";
import Tiles from "./elements/Tiles";

import defaultGame from "../data/games/1889.json";
import GameContext from "../context/GameContext";

const Elements = () => {
  return (
    <GameContext.Provider value={{game: defaultGame}}>
      <Routes>
        <Route path="/tiles" element={<Tiles/>}/>
        <Route path="/logos" element={<Logos/>}/>
        <Route path="*" element={<Atoms/>}/>
      </Routes>
    </GameContext.Provider>
  );
};

export default Elements;
