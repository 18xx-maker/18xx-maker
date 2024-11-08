import { Outlet } from "react-router-dom";

import { games } from "../data";
import GameContext from "../context/GameContext";

const defaultGame = games["1889"];

const Elements = () => {
  return (
    <GameContext.Provider value={{ game: defaultGame }}>
      <Outlet />
    </GameContext.Provider>
  );
};

export default Elements;
