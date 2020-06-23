import React, { createContext, useContext } from "react";
import { useGame } from "./GameContext";

const OrientationContext = createContext(0);

export const useOrientation = () => {
  return useContext(OrientationContext);
}

export const MapOrientation = ({ children }) => {
  const { game } = useGame();

  const rotation = (game && game.info.orientation === "horizontal")
        ? 0
        : 90;

  return <OrientationContext.Provider value={rotation}>
           {children}
         </OrientationContext.Provider>;
}

export default OrientationContext;
