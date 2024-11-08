import { Route, Routes } from "react-router-dom";

import Atoms from "./elements/Atoms";
import Logos from "./elements/Logos";
import Tiles from "./elements/Tiles";

import { games } from "../data";
import GameContext from "../context/GameContext";

const defaultGame = games["1889"];

const Elements = () => {
  return (
    <GameContext.Provider value={{ game: defaultGame }}>
      <Routes>
        <Route path="" element={<Atoms />} />
        <Route path="tiles" element={<Tiles />} />
        <Route path="logos" element={<Logos />} />
      </Routes>
    </GameContext.Provider>
  );
};

export default Elements;
