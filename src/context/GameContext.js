import { createContext } from "react";

// Optional override of the game and config read by useGame and useConfig
// (the play board renders a game that is not the one in the store).
// Value: { game, config } or null.
const GameContext = createContext(null);

export default GameContext;
